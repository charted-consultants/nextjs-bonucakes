/**
 * Order Email Templates
 * Templates for admin notification and customer confirmation emails
 */

export interface OrderItem {
  productId: string | number;
  productName: string;
  quantity: number;
  unitPrice: number;
  unitVi?: string;
  unitEn?: string;
  unit?: string;
  freeItems?: number;
  actualQuantity?: number;
}

export interface OrderEmailData {
  orderCode: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryDate?: string;
  specialNotes?: string;
  paymentMethod?: 'bank_transfer' | 'stripe';
  items: OrderItem[];
  pricing: {
    currency: string;
    subtotal: number;
    shippingFee: number;
    total: number;
    shippingLabel: string;
  };
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  sortCode: string;
  accountNumber: string;
}

// Helper function to format money
function formatMoney(amount: number, currency: string): string {
  if (currency === 'GBP') {
    return `£${amount.toFixed(2)}`;
  }
  return `${amount.toLocaleString('vi-VN')}đ`;
}

// Generate admin notification email
export function generateAdminEmail(data: OrderEmailData, submissionDate: string): string {
  const { orderCode, customerName, customerEmail, customerPhone, deliveryAddress, deliveryDate, specialNotes, items, pricing } = data;
  const { currency, subtotal, shippingFee, total, shippingLabel } = pricing;

  const orderItemsHtml = items.map(item => {
    const uPrice = Number(item.unitPrice) || 0;
    const lineTotal = uPrice * item.quantity;
    const unitLabel = item.unitVi || item.unit || '';

    return `
      <div class="order-box">
        <p style="margin: 0 0 6px 0; font-size: 1.1em;"><strong>${item.quantity}x ${item.productName}</strong></p>
        ${uPrice > 0 ? `<p style="margin: 0 0 6px 0; color: #4a5c52;">${formatMoney(uPrice, currency)}${unitLabel ? ' / ' + unitLabel : ''} × ${item.quantity} = <strong>${formatMoney(lineTotal, currency)}</strong></p>` : ''}
        ${item.freeItems && item.freeItems > 0 ? `<p style="margin: 0; color: #083121; font-weight: bold;">Mua 10 tặng 1 (thực tế ${item.actualQuantity} ổ)</p>` : ''}
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #083121; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 8px; background: #f8faf9; }
          .header { background: linear-gradient(135deg, #083121 0%, #4a5c52 100%); color: #f8faf9; padding: 20px 12px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 16px 12px; border: 1px solid #fcc56c; border-top: none; border-radius: 0 0 8px 8px; }
          .highlight { background: #f8faf9; padding: 12px; border-left: 4px solid #fcc56c; margin: 16px 0; border-radius: 4px; }
          .label { font-weight: bold; color: #083121; display: inline-block; min-width: 140px; }
          .order-box { background: #f8faf9; padding: 12px; border: 2px solid #fcc56c; border-radius: 4px; margin: 16px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 2em;">Đơn hàng mới</h1>
            <p style="margin: 10px 0 0 0; color: #fcc56c;">Bonu F&B</p>
          </div>
          <div class="content">
            <div class="highlight">
              <p style="margin: 0; font-weight: bold; color: #083121; font-size: 1.2em;">Mã đơn hàng: #${orderCode}</p>
              <p style="margin: 5px 0 0 0; color: #4a5c52;">Nhận được ngày ${submissionDate}</p>
            </div>

            <h2 style="color: #083121; margin-top: 30px;">THÔNG TIN KHÁCH HÀNG</h2>
            <p><span class="label">Họ tên:</span> <span style="color: #4a5c52;">${customerName}</span></p>
            <p><span class="label">Email:</span> <span style="color: #4a5c52;"><a href="mailto:${customerEmail}" style="color: #083121;">${customerEmail}</a></span></p>
            <p><span class="label">Số điện thoại:</span> <span style="color: #4a5c52;">${customerPhone}</span></p>
            <p><span class="label">Địa chỉ giao hàng:</span> <span style="color: #4a5c52;">${deliveryAddress}</span></p>
            ${deliveryDate ? `<p><span class="label">Ngày giao mong muốn:</span> <span style="color: #4a5c52;">${deliveryDate}</span></p>` : ''}

            <h2 style="color: #083121; margin-top: 30px;">CHI TIẾT ĐƠN HÀNG</h2>
            ${orderItemsHtml}

            <h2 style="color: #083121; margin-top: 30px;">TỔNG KẾT THANH TOÁN</h2>
            <div class="order-box">
              <p style="margin: 0 0 8px 0;">Tạm tính: <strong>${formatMoney(subtotal, currency)}</strong></p>
              <p style="margin: 0 0 8px 0;">Phí giao hàng (${shippingLabel}): <strong>${formatMoney(shippingFee, currency)}</strong></p>
              <p style="margin: 8px 0 0 0; font-size: 1.1em;">Tổng cộng: <strong>${formatMoney(total, currency)}</strong></p>
            </div>

            ${specialNotes ? `
              <h2 style="color: #083121; margin-top: 30px;">GHI CHÚ</h2>
              <p style="background: #f8faf9; padding: 12px; border-radius: 4px; color: #4a5c52;">${specialNotes}</p>
            ` : ''}

            <div style="margin-top: 30px; padding: 20px; background: #f8faf9; border-radius: 4px;">
              <p style="margin: 0; color: #083121; font-weight: bold;">Vui lòng xác nhận đơn hàng và liên hệ khách sau khi nhận được thanh toán.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

// Generate customer confirmation email
export function generateCustomerEmail(data: OrderEmailData, bankDetails?: BankDetails): string {
  const { orderCode, customerName, items, pricing, deliveryDate, paymentMethod = 'bank_transfer' } = data;
  const { currency, subtotal, shippingFee, total, shippingLabel } = pricing;

  const orderItemsHtml = items.map(item => {
    const uPrice = Number(item.unitPrice) || 0;
    const lineTotal = uPrice * item.quantity;
    const unitLabel = item.unitVi || item.unit || '';

    return `
      <div class="order-box">
        <p style="margin: 0 0 6px 0; font-size: 1.1em;"><strong>${item.quantity}x ${item.productName}</strong></p>
        ${uPrice > 0 ? `<p style="margin: 0 0 6px 0; color: #4a5c52;">${formatMoney(uPrice, currency)}${unitLabel ? ' / ' + unitLabel : ''} × ${item.quantity} = <strong>${formatMoney(lineTotal, currency)}</strong></p>` : ''}
        ${item.freeItems && item.freeItems > 0 ? `<p style="margin: 0; color: #083121; font-weight: bold;">Mua 10 tặng 1 (thực tế ${item.actualQuantity} ổ)</p>` : ''}
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; color: #083121; margin: 0; padding: 0; }
          .container { max-width: 650px; margin: 0 auto; padding: 8px; background: #f8faf9; }
          .header { background: linear-gradient(135deg, #083121 0%, #4a5c52 100%); color: #f8faf9; padding: 20px 12px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #ffffff; padding: 16px 12px; border: 1px solid #fcc56c; border-top: none; border-radius: 0 0 8px 8px; }
          .order-box { background: #f8faf9; padding: 12px; border: 2px solid #fcc56c; border-radius: 4px; margin: 16px 0; }
          .warning { background: #FFF3E0; padding: 12px; border-left: 4px solid #F57C00; margin: 16px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-family: 'Playfair Display', serif; font-size: 2em; color: #fcc56c;">Bonu F&B</h1>
            <p style="margin: 10px 0 0 0; color: #f8faf9;">${paymentMethod === 'stripe' ? 'Xác nhận đơn hàng' : 'Đơn hàng đã nhận'}</p>
          </div>
          <div class="content">
            <p style="font-size: 1.1em;">Xin chào ${customerName},</p>

            <p>Cảm ơn bạn đã đặt hàng tại Bonu Cakes! ${paymentMethod === 'stripe' ? 'Đơn hàng của bạn đã được xác nhận.' : 'Chúng tôi đã nhận được đơn hàng và đang chờ thanh toán.'}</p>

            <div style="background: #f8faf9; padding: 15px; border-left: 4px solid #fcc56c; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 5px 0; color: #083121; font-weight: bold;">MÃ ĐƠN HÀNG</p>
              <p style="margin: 0; font-size: 1.3em; font-weight: bold; color: #083121;">#${orderCode}</p>
            </div>

            <h2 style="color: #083121; margin-top: 30px;">CHI TIẾT ĐƠN HÀNG</h2>
            ${orderItemsHtml}
            ${deliveryDate ? `<p style="margin: 10px 0 0 0;"><strong>Ngày giao dự kiến:</strong> ${deliveryDate}</p>` : ''}

            <h2 style="color: #083121; margin-top: 30px;">TỔNG KẾT THANH TOÁN</h2>
            <div class="order-box">
              <p style="margin: 0 0 8px 0;">Tạm tính: <strong>${formatMoney(subtotal, currency)}</strong></p>
              <p style="margin: 0 0 8px 0;">Phí giao hàng (${shippingLabel}): <strong>${formatMoney(shippingFee, currency)}</strong></p>
              <p style="margin: 8px 0 0 0; font-size: 1.1em;">Tổng cộng: <strong>${formatMoney(total, currency)}</strong></p>
            </div>

            ${paymentMethod === 'stripe' ? `
              <div style="background: #E8F5E9; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0; border-radius: 4px;">
                <p style="margin: 0 0 5px 0; color: #2E7D32; font-weight: bold; font-size: 1.1em;">THANH TOÁN THÀNH CÔNG</p>
                <p style="margin: 0; color: #4a5c52;">Thanh toán của bạn đã được xử lý thành công. Đơn hàng của bạn đã được xác nhận và sẽ sớm được chuẩn bị.</p>
              </div>
            ` : bankDetails ? `
              <h2 style="color: #083121; margin-top: 30px;">THANH TOÁN</h2>
              <p>Vui lòng chuyển khoản theo thông tin dưới đây:</p>
              <div class="order-box">
                <p style="margin: 0 0 8px 0;"><strong>Ngân hàng:</strong> ${bankDetails.bankName}</p>
                <p style="margin: 0 0 8px 0;"><strong>Tên tài khoản:</strong> ${bankDetails.accountName}</p>
                <p style="margin: 0 0 8px 0;"><strong>Sort Code:</strong> ${bankDetails.sortCode}</p>
                <p style="margin: 0 0 8px 0;"><strong>Số tài khoản:</strong> ${bankDetails.accountNumber}</p>
                <p style="margin: 0; padding-top: 10px; border-top: 1px solid #fcc56c;"><strong>Nội dung chuyển khoản:</strong> <span style="color: #083121; font-size: 1.1em;">#${orderCode}</span></p>
              </div>
              <div class="warning">
                <p style="margin: 0; color: #F57C00; font-weight: bold;">ĐƠN HÀNG ĐANG CHỜ THANH TOÁN</p>
                <p style="margin: 8px 0 0 0; color: #4a5c52;">Đơn hàng sẽ được xác nhận sau khi chúng tôi nhận được thanh toán.</p>
              </div>
            ` : ''}

            <div class="warning">
              <p style="margin: 0 0 10px 0; font-weight: bold; color: #F57C00;">LƯU Ý QUAN TRỌNG</p>
              <ul style="margin: 0; padding-left: 20px; color: #4a5c52;">
                <li>Phải cho vào tủ lạnh ngay khi nhận hàng</li>
                <li>Thịt và nhân sẽ nhanh hư nếu không bảo quản lạnh</li>
                <li>Không hâm nóng đồ chua</li>
              </ul>
            </div>

            <h2 style="color: #083121; margin-top: 30px;">HƯỚNG DẪN SỬ DỤNG</h2>
            <p><strong>1. Nướng lại bánh:</strong> Lò 180-200°C trong 5-7 phút hoặc dùng chảo chống dính</p>
            <p><strong>2. Làm ấm nhân:</strong> Để nhiệt độ phòng 5-10 phút (có thể microwave pate/thịt 30s)</p>
            <p><strong>3. Ráp bánh:</strong> Rạch bánh - sốt bơ - pate - thịt - chả bông - đồ chua - chả lụa</p>
            <p><strong>4. Ngon nhất khi ăn nóng!</strong></p>

            <p style="margin-top: 30px;">Chúng tôi sẽ liên hệ với bạn để xác nhận chi tiết đơn hàng.</p>

            <p style="margin-top: 20px;">Nếu có thắc mắc, vui lòng trả lời email này hoặc liên hệ qua Facebook.</p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #fcc56c;">
              <p style="color: #4a5c52; margin: 0; font-style: italic;">Trân trọng,</p>
              <p style="color: #083121; margin: 4px 0 0 0; font-weight: bold; font-family: 'Playfair Display', serif; font-size: 1.1em;">Uyen Nguyen</p>
              <p style="color: #4a5c52; margin: 4px 0 0 0; font-size: 0.9em;">Bonu F&B</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
