import { prisma } from '@/lib/prisma';

export interface OrderTemplateVars {
  orderCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  submissionDate: string;
  deliveryDate: string;
  specialNotes: string;
  orderItemsHtml: string;
  subtotal: string;
  shippingFee: string;
  shippingLabel: string;
  total: string;
  paymentSectionHtml: string;
}

export function renderTemplate(html: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, value ?? '');
  }, html);
}

export async function getOrderTemplate(name: 'order-customer' | 'order-admin'): Promise<{ subject: string; html: string } | null> {
  try {
    const template = await prisma.emailTemplate.findFirst({
      where: { name, active: true, deletedAt: null },
    });
    if (!template) return null;
    return { subject: template.subject || '', html: template.htmlContent };
  } catch {
    return null;
  }
}
