/**
 * Order Success Page
 * Order confirmation with payment instructions and storage guidelines
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, AlertTriangle, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/components/LanguageToggle';

function OrderSuccessContent() {
  const currentLang = useLanguage();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string>('');
  const [displayCode, setDisplayCode] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string>('');

  useEffect(() => {
    const id = searchParams.get('orderId');
    const code = searchParams.get('code');

    if (id) {
      setOrderId(id);
      if (code && /^[0-9]{4}$/.test(code)) {
        setDisplayCode(`#${code}`);
      } else {
        // Generate code from order ID if not provided
        const generated = shortCodeFrom(id);
        setDisplayCode(`#${generated}`);
      }

      // Fetch order details to check payment method
      fetch(`/api/orders/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.paymentMethod) {
            setPaymentMethod(data.paymentMethod);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch order:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setDisplayCode('N/A');
      setLoading(false);
    }
  }, [searchParams]);

  const shortCodeFrom = (id: string): string => {
    if (!id) return '';
    let h = 5381;
    for (let i = 0; i < id.length; i++) {
      h = ((h << 5) + h) + id.charCodeAt(i);
    }
    const n = Math.abs(h >>> 0) % 10000;
    return String(n).padStart(4, '0');
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
    setUploadStatus('idle');
    setUploadError('');
  };

  const handleProofUpload = async () => {
    if (!proofFile || !orderId) return;
    setUploadStatus('uploading');
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('file', proofFile);
      const res = await fetch(`/api/orders/${orderId}/payment-proof`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setUploadStatus('success');
    } catch (err: any) {
      setUploadStatus('error');
      setUploadError(err.message || 'Upload thất bại, vui lòng thử lại.');
    }
  };

  const translations = {
    title: { vi: 'Đặt hàng thành công!', en: 'Order Placed Successfully!' },
    subtitle: {
      vi: 'Cảm ơn bạn đã đặt hàng tại Bonu F&B',
      en: 'Thank you for your order at Bonu F&B',
    },
    orderIdLabel: { vi: 'Mã đơn hàng', en: 'Order ID' },
    confirmationSent: { vi: 'Email xác nhận đã được gửi', en: 'Confirmation Email Sent' },
    confirmationText: {
      vi: 'Bếp Bà Bo đã gửi email xác nhận đơn hàng và hướng dẫn thanh toán đến địa chỉ email của bạn.',
      en: 'We have sent an order confirmation email and payment instructions to your email address.',
    },
    confirmationTextStripe: {
      vi: 'Bếp Bà Bo đã gửi email xác nhận đơn hàng đến địa chỉ email của bạn.',
      en: 'We have sent an order confirmation email to your email address.',
    },
    paymentSuccess: { vi: 'Thanh toán thành công!', en: 'Payment Successful!' },
    paymentSuccessText: {
      vi: 'Thanh toán của bạn đã được xử lý thành công. Đơn hàng của bạn đã được xác nhận và sẽ sớm được chuẩn bị.',
      en: 'Your payment has been processed successfully. Your order is confirmed and will be prepared soon.',
    },
    paymentInstructions: { vi: 'Hướng dẫn thanh toán', en: 'Payment Instructions' },
    bank: { vi: 'Ngân hàng', en: 'Bank' },
    accountName: { vi: 'Tên tài khoản', en: 'Account Name' },
    sortCode: { vi: 'Sort Code', en: 'Sort Code' },
    accountNumber: { vi: 'Số tài khoản', en: 'Account Number' },
    transferNote: { vi: 'Nội dung chuyển khoản', en: 'Transfer Note' },
    amount: { vi: 'Số tiền', en: 'Amount' },
    uploadTitle: { vi: 'Gửi ảnh xác nhận chuyển khoản', en: 'Upload Payment Confirmation' },
    uploadDesc: { vi: 'Sau khi chuyển khoản thành công, vui lòng chụp màn hình và tải lên để Bếp xác nhận nhanh hơn.', en: 'After transferring, please upload a screenshot so we can confirm your payment faster.' },
    uploadBtn: { vi: 'Chọn ảnh', en: 'Choose Image' },
    uploadSend: { vi: 'Gửi ảnh cho Bếp', en: 'Send to Us' },
    uploadSending: { vi: 'Đang gửi...', en: 'Sending...' },
    uploadSuccess: { vi: 'Đã gửi! Bếp sẽ xác nhận đơn hàng sớm nhất.', en: 'Sent! We will confirm your order shortly.' },
    noteLabel: { vi: 'Lưu ý:', en: 'Note:' },
    noteText: {
      vi: 'Quý khách vui lòng chuyển khoản đúng nội dung bằng cách copy từng mục thông tin vào nội dung chuyển khoản để Bếp nhà Bo xác nhận đơn hàng chính xác. Xin cám ơn.',
      en: 'Please copy each field above and use it as your transfer reference so we can confirm your order accurately. Thank you.',
    },
    whatHappensNext: { vi: 'Tiếp theo sẽ như thế nào?', en: 'What Happens Next?' },
    step1Title: { vi: 'Thanh toán', en: 'Payment' },
    step1Text: {
      vi: 'Chuyển khoản theo hướng dẫn bên trên với nội dung chính xác',
      en: 'Transfer payment as instructed above with the exact transfer note',
    },
    step2Title: { vi: 'Xác nhận', en: 'Confirmation' },
    step2Text: {
      vi: 'Sau khi nhận được thanh toán, Bếp sẽ liên hệ với bạn để xác nhận đơn hàng và thời gian giao',
      en: 'After receiving payment, we will contact you to confirm your order and delivery time',
    },
    step3Title: { vi: 'Chuẩn bị', en: 'Preparation' },
    step3Text: {
      vi: 'Đơn hàng của bạn sẽ được làm tươi vào sáng và chuẩn bị giao hàng',
      en: 'Your order will be made fresh in the morning and prepared for delivery',
    },
    step4Title: { vi: 'Giao hàng', en: 'Delivery' },
    step4Text: {
      vi: 'Bếp sẽ giao hàng qua DPD hoặc DHL. Bạn sẽ nhận hàng vào ngày đã chọn.',
      en: 'Next-day shipping via DPD or DHL. You will receive your order on the selected date.',
    },
    shippingWarningTitle: { vi: 'Lưu ý quan trọng về giao hàng', en: 'Important Shipping Notice' },
    shippingWarning1: {
      vi: 'Bếp Bà Bo kiểm soát chất lượng đồ ăn khi đóng gói nhưng KHÔNG THỂ kiểm soát thời gian giao hàng của đơn vị vận chuyển (DPD/DHL). Nếu đơn hàng bị giao trễ, Bếp không thể đảm bảo chất lượng sản phẩm.',
      en: 'We control food quality during packaging but CANNOT control delivery delays by shipping companies (DPD/DHL). If delivery is delayed, we cannot guarantee product quality.',
    },
    shippingWarning2: {
      vi: 'Nếu bạn nhận đồ hư hỏng hoặc không ăn được, vui lòng báo ngay cho Bếp. Bếp sẽ refund hoặc gửi lại đơn hàng mới.',
      en: 'If you receive damaged or inedible food, please report immediately. We will refund or send a new order.',
    },
    storageInstructions: { vi: 'Hướng dẫn bảo quản', en: 'Storage Instructions' },
    storage1: {
      vi: 'Cho vào tủ lạnh NGAY khi nhận hàng',
      en: 'Refrigerate IMMEDIATELY upon receiving',
    },
    storage2: { vi: 'Bảo quản trong tủ lạnh: 1 tuần', en: 'Refrigerated storage: 1 week' },
    storage3: { vi: 'Bảo quản trong tủ đá: 1-3 tháng', en: 'Frozen storage: 1-3 months' },
    storage4: {
      vi: 'Nếu đông đá, chia nhỏ từng phần để dễ sử dụng',
      en: 'If freezing, divide into portions for easier use',
    },
    needHelp: { vi: 'Cần hỗ trợ?', en: 'Need Help?' },
    needHelpText: {
      vi: 'Nếu có bất kỳ thắc mắc nào về đơn hàng, vui lòng liên hệ với Bếp:',
      en: 'If you have any questions about your order, please contact us:',
    },
    messageFacebook: { vi: 'Nhắn tin Facebook', en: 'Message on Facebook' },
    continueShopping: { vi: 'Tiếp tục mua sắm', en: 'Continue Shopping' },
    backToHome: { vi: 'Quay lại trang chủ', en: 'Back to Home' },
  };

  return (
    <main className="pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-6">
          {/* Success Header */}
          <div className="text-center mb-12">
            <CheckCircle className="h-20 w-20 mx-auto text-green-600 mb-4" />
            <h1 className="text-4xl font-bold text-primary mb-4 font-serif">
              {translations.title[currentLang]}
            </h1>
            <p className="text-xl text-muted">{translations.subtitle[currentLang]}</p>
          </div>

          {/* Order Details */}
          <div className="bg-white border border-primary/10 p-8 mb-8">
            <div className="border-b border-primary/10 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-primary mb-2 font-serif">
                {translations.orderIdLabel[currentLang]}
              </h2>
              <p className="text-3xl font-bold text-secondary">{displayCode}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-primary mb-3">
                {translations.confirmationSent[currentLang]}
              </h3>
              <p className="text-muted">
                {paymentMethod === 'stripe'
                  ? translations.confirmationTextStripe[currentLang]
                  : translations.confirmationText[currentLang]}
              </p>
            </div>
          </div>

          {/* Payment Success Message (Stripe) */}
          {paymentMethod === 'stripe' && (
            <div className="bg-green-50 border-2 border-green-500 p-8 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-green-900 mb-3 font-serif">
                    {translations.paymentSuccess[currentLang]}
                  </h2>
                  <p className="text-green-800">{translations.paymentSuccessText[currentLang]}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Instructions (Bank Transfer) */}
          {paymentMethod === 'bank_transfer' && (
            <div className="bg-secondary/10 border-2 border-secondary/50 p-8 mb-8">
              <h2 className="text-2xl font-bold text-primary mb-6 font-serif">
                {translations.paymentInstructions[currentLang]}
              </h2>

              <div className="flex flex-col md:flex-row gap-8">
                {/* Bank details + copy buttons */}
                <div className="flex-1 space-y-3 text-muted">
                  {[
                    { label: translations.bank[currentLang], value: 'Tide (Business Account)', field: 'bank' },
                    { label: translations.accountName[currentLang], value: 'Bonu Cakes Ltd', field: 'accountName' },
                    { label: translations.sortCode[currentLang], value: '04-06-05', field: 'sortCode', mono: true },
                    { label: translations.accountNumber[currentLang], value: '18828806', field: 'accountNumber', mono: true },
                    { label: translations.transferNote[currentLang], value: displayCode, field: 'transferNote', mono: true, bold: true },
                  ].map(({ label, value, field, mono, bold }) => (
                    <div key={field} className="flex items-center justify-between border-b border-secondary/30 pb-3 gap-2">
                      <span className="font-semibold shrink-0">{label}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-right${mono ? ' font-mono' : ''}${bold ? ' font-bold' : ''}`}>{value}</span>
                        <button
                          onClick={() => copyToClipboard(value, field)}
                          title="Copy"
                          className="p-1 rounded hover:bg-secondary/20 transition-colors text-primary/60 hover:text-primary"
                        >
                          {copiedField === field ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              <div className="mt-6 bg-white p-4 border border-secondary/30">
                <p className="text-sm text-muted">
                  <strong>{translations.noteLabel[currentLang]}</strong>{' '}
                  {translations.noteText[currentLang]}
                </p>
              </div>

              {/* Upload payment proof */}
              {uploadStatus !== 'success' ? (
                <div className="mt-6 border-2 border-dashed border-secondary/40 rounded p-5 bg-white">
                  <h3 className="font-semibold text-primary mb-1">{translations.uploadTitle[currentLang]}</h3>
                  <p className="text-sm text-muted mb-4">{translations.uploadDesc[currentLang]}</p>

                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 hover:bg-secondary/30 text-primary font-semibold rounded transition-colors text-sm">
                      <span>{translations.uploadBtn[currentLang]}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                    </label>

                    {proofFile && (
                      <button
                        onClick={handleProofUpload}
                        disabled={uploadStatus === 'uploading'}
                        className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white font-semibold rounded hover:bg-primary/90 disabled:opacity-50 transition-colors text-sm"
                      >
                        {uploadStatus === 'uploading'
                          ? translations.uploadSending[currentLang]
                          : translations.uploadSend[currentLang]}
                      </button>
                    )}
                  </div>

                  {proofPreview && (
                    <div className="mt-3">
                      <img
                        src={proofPreview}
                        alt="Preview"
                        className="max-h-40 rounded border border-secondary/30 object-contain"
                      />
                      <p className="text-xs text-muted mt-1">{proofFile?.name}</p>
                    </div>
                  )}

                  {uploadStatus === 'error' && (
                    <p className="mt-2 text-sm text-red-600">{uploadError}</p>
                  )}
                </div>
              ) : (
                <div className="mt-6 bg-green-50 border-2 border-green-400 rounded p-5 flex items-start gap-3">
                  <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800">{translations.uploadSuccess[currentLang]}</p>
                    {proofPreview && (
                      <img
                        src={proofPreview}
                        alt="Uploaded proof"
                        className="mt-2 max-h-32 rounded border border-green-300 object-contain"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* What Happens Next */}
          <div className="bg-light border border-primary/10 p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-6 font-serif">
              {translations.whatHappensNext[currentLang]}
            </h2>

            <div className="space-y-6">
              {(paymentMethod === 'stripe'
                ? [
                    { title: translations.step2Title, text: translations.step2Text },
                    { title: translations.step3Title, text: translations.step3Text },
                    { title: translations.step4Title, text: translations.step4Text },
                  ]
                : [
                    { title: translations.step1Title, text: translations.step1Text },
                    { title: translations.step2Title, text: translations.step2Text },
                    { title: translations.step3Title, text: translations.step3Text },
                    { title: translations.step4Title, text: translations.step4Text },
                  ]
              ).map((step, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary mb-2">
                      {step.title[currentLang]}
                    </h3>
                    <p className="text-muted">{step.text[currentLang]}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Warning */}
          <div className="bg-red-50 border-2 border-red-300 p-6 mb-8">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-900 mb-2">
                  {translations.shippingWarningTitle[currentLang]}
                </h3>
                <p className="text-red-800 text-sm mb-2">
                  {translations.shippingWarning1[currentLang]}
                </p>
                <p className="text-red-800 text-sm">
                  {translations.shippingWarning2[currentLang]}
                </p>
              </div>
            </div>
          </div>

          {/* Storage Instructions */}
          <div className="bg-light border border-primary/10 p-8 mb-8">
            <h2 className="text-2xl font-bold text-primary mb-4 font-serif">
              {translations.storageInstructions[currentLang]}
            </h2>
            <ul className="space-y-3 text-muted">
              {[
                translations.storage1,
                translations.storage2,
                translations.storage3,
                translations.storage4,
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-secondary font-bold">•</span>
                  <span>{item[currentLang]}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="bg-primary text-light p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 font-serif">
              {translations.needHelp[currentLang]}
            </h2>
            <p className="mb-4">{translations.needHelpText[currentLang]}</p>
            <a
              href="https://www.facebook.com/profile.php?id=100009102362568"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-secondary text-primary px-6 py-3 font-semibold hover:bg-secondary/90 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>{translations.messageFacebook[currentLang]}</span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="text-center space-y-4">
            <Link
              href="/products"
              className="inline-block bg-primary text-white px-8 py-4 font-semibold text-lg hover:bg-primary/90 transition-colors"
            >
              {translations.continueShopping[currentLang]}
            </Link>
            <div>
              <Link
                href="/"
                className="text-muted hover:text-secondary transition-colors"
              >
                {translations.backToHome[currentLang]}
              </Link>
            </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="pt-32 text-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
