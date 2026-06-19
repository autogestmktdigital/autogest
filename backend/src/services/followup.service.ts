import cron from 'node-cron';
import { prisma } from '../config';
import { FollowUpStatus, FollowUpType, LeadStatus } from '@prisma/client';
import { openaiService } from './openai.service';

export class FollowUpService {
  async scheduleWelcome24h(leadId: number) {
    const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return prisma.followUp.create({
      data: {
        leadId,
        type: FollowUpType.welcome_24h,
        status: FollowUpStatus.scheduled,
        scheduledFor,
      },
    });
  }

  async scheduleCheckInterest(leadId: number, daysAfter: number = 3) {
    const scheduledFor = new Date(Date.now() + daysAfter * 24 * 60 * 60 * 1000);

    return prisma.followUp.create({
      data: {
        leadId,
        type: FollowUpType.check_interest,
        status: FollowUpStatus.scheduled,
        scheduledFor,
      },
    });
  }

  async processPendingFollowUps() {
    const pendingFollowUps = await prisma.followUp.findMany({
      where: {
        status: FollowUpStatus.scheduled,
        scheduledFor: { lte: new Date() },
      },
      include: {
        lead: {
          include: {
            conversations: {
              orderBy: { lastMessageAt: 'desc' },
              take: 1,
              include: { messages: { orderBy: { sentAt: 'desc' }, take: 3 } },
            },
          },
        },
      },
      take: 50,
    });

    const results = [];

    for (const followUp of pendingFollowUps) {
      try {
        if (followUp.lead.status === LeadStatus.converted || followUp.lead.status === LeadStatus.lost) {
          await prisma.followUp.update({
            where: { id: followUp.id },
            data: { status: FollowUpStatus.cancelled },
          });
          continue;
        }

        const lastMessages = followUp.lead.conversations[0]?.messages || [];
        const lastInteraction = lastMessages.map((m) => `${m.role}: ${m.content}`).join('\n');

        const message = await openaiService.generateFollowUpMessage({
          leadName: followUp.lead.name || 'Cliente',
          lastInteraction: lastInteraction || 'Primeiro contato',
          followUpType: followUp.type,
        });

        await prisma.followUp.update({
          where: { id: followUp.id },
          data: {
            status: FollowUpStatus.sent,
            sentAt: new Date(),
            messageContent: message,
          },
        });

        results.push({ id: followUp.id, leadId: followUp.leadId, status: 'sent', message });
      } catch (error) {
        console.error(`Erro no follow-up ${followUp.id}:`, error);
        await prisma.followUp.update({
          where: { id: followUp.id },
          data: { status: FollowUpStatus.failed },
        });
        results.push({ id: followUp.id, leadId: followUp.leadId, status: 'failed' });
      }
    }

    return results;
  }

  async listByLead(leadId: number) {
    return prisma.followUp.findMany({
      where: { leadId },
      orderBy: { scheduledFor: 'desc' },
    });
  }

  async cancelFollowUp(id: number) {
    return prisma.followUp.update({
      where: { id },
      data: { status: FollowUpStatus.cancelled },
    });
  }

  startCronJobs() {
    // Processa follow-ups a cada 15 minutos
    cron.schedule('*/15 * * * *', async () => {
      console.log('[CRON] Processando follow-ups pendentes...');
      try {
        const results = await this.processPendingFollowUps();
        if (results.length > 0) {
          console.log(`[CRON] ${results.length} follow-ups processados`);
        }
      } catch (error) {
        console.error('[CRON] Erro ao processar follow-ups:', error);
      }
    });

    console.log('[CRON] Jobs de follow-up iniciados');
  }
}

export const followUpService = new FollowUpService();
