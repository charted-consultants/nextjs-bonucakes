'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import BlogContent, { BlogContentData } from '@/components/BlogContent';
import { useLanguage } from '@/components/LanguageToggle';
import Link from 'next/link';

// Mock blog posts data with full content
const mockPostsData: Record<string, BlogContentData> = {
  'why-most-fb-businesses-fail': {
    title: 'Tại sao 80% doanh nghiệp F&B thất bại trong 5 năm đầu',
    titleEn: 'Why 80% of F&B Businesses Fail Within 5 Years',
    excerpt: 'Bài học từ 10 năm kinh doanh: Những sai lầm phổ biến khiến nhà hàng thất bại và cách tránh chúng.',
    excerptEn: 'Lessons from 10 years in business: Common mistakes that cause restaurant failures and how to avoid them.',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1200&auto=format&fit=crop&q=80',
    date: '2026-02-15',
    author: 'Uyen Nguyen',
    content: `Sau 10 năm làm việc trong ngành F&B, tôi đã chứng kiến vô số nhà hàng mở cửa với đầy hy vọng, rồi khép lại trong im lặng. Thống kê cho thấy 80% doanh nghiệp F&B không thể tồn tại quá 5 năm. Tại sao?

## Sai lầm 1: Không có nền tảng vững chắc

Nhiều người nghĩ rằng chỉ cần biết nấu ăn ngon là đủ để mở nhà hàng. Nhưng thực tế, F&B là một ngành kinh doanh phức tạp đòi hỏi nhiều kỹ năng: quản lý tài chính, marketing, quản trị nhân sự, và quan trọng nhất là hiểu về chi phí hoạt động.

Tôi từng gặp một chủ nhà hàng tài năng, món ăn tuyệt vời nhưng không biết tính food cost. Kết quả? Làm việc vất vả suốt 2 năm nhưng không có lợi nhuận.

## Sai lầm 2: Copy người khác

"Quán bên đó đông khách quá, mình làm y như vậy chắc cũng thành công." Đây là tư duy sai lầm phổ biến nhất. Mỗi nhà hàng thành công đều có câu chuyện riêng, bản sắc riêng.

Khi tôi mở Memoire Saigon, tôi không copy ai. Tôi kể câu chuyện của chính mình - một người Việt xa quê hương, muốn mang hương vị Sài Gòn đến Manchester. Đó là điều làm nên khác biệt.

## Sai lầm 3: Thiếu kế hoạch tài chính

> "Dòng tiền là huyết mạch của kinh doanh. Không có dòng tiền, dù bạn có ý tưởng hay đến đâu cũng không thể tồn tại."

80% nhà hàng thất bại vì vấn đề dòng tiền, không phải vì món ăn không ngon. Họ không tính đúng chi phí ban đầu, không dự phòng vốn cho 6 tháng đầu thua lỗ, không hiểu về điểm hòa vốn.

## Giải pháp: Xây dựng nền tảng trước khi bắt đầu

Trước khi mở nhà hàng, hãy tự hỏi:

- Bạn có hiểu về quản lý tài chính không?
- Bạn có câu chuyện riêng để kể không?
- Bạn có đủ vốn cho ít nhất 6 tháng đầu không?
- Bạn có đội ngũ tin tưởng và gắn bó không?

Nếu câu trả lời cho bất kỳ câu hỏi nào là "không", đừng vội mở. Hãy học, hãy chuẩn bị. Thất bại không đáng sợ, nhưng thất bại vì thiếu chuẩn bị thì đáng tiếc.`,
    contentEn: `After 10 years working in the F&B industry, I've witnessed countless restaurants open with great hopes, only to close quietly. Statistics show that 80% of F&B businesses don't survive past 5 years. Why?

## Mistake 1: Lack of solid foundation

Many people think that knowing how to cook well is enough to open a restaurant. But in reality, F&B is a complex business that requires many skills: financial management, marketing, human resources management, and most importantly, understanding operating costs.

I once met a talented restaurant owner with amazing food but didn't know how to calculate food cost. Result? Working hard for 2 years but no profit.

## Mistake 2: Copying others

"That restaurant is so crowded, if I do the same thing I'll succeed too." This is the most common mistaken mindset. Every successful restaurant has its own story, its own identity.

When I opened Memoire Saigon, I didn't copy anyone. I told my own story - a Vietnamese person far from home, wanting to bring Saigon flavors to Manchester. That's what made the difference.

## Mistake 3: Lack of financial planning

> "Cash flow is the lifeblood of business. Without cash flow, no matter how great your idea is, you can't survive."

80% of restaurants fail due to cash flow issues, not because the food isn't good. They don't calculate initial costs correctly, don't reserve capital for the first 6 months of losses, don't understand break-even points.

## Solution: Build foundation before starting

Before opening a restaurant, ask yourself:

- Do you understand financial management?
- Do you have your own story to tell?
- Do you have enough capital for at least the first 6 months?
- Do you have a trusted and committed team?

If the answer to any question is "no", don't rush to open. Learn, prepare. Failure isn't scary, but failure due to lack of preparation is regrettable.`
  },
  'building-authentic-brand': {
    title: 'Xây dựng thương hiệu F&B từ chính mình',
    titleEn: 'Building an Authentic F&B Brand',
    excerpt: 'Tại sao "bản sắc" quan trọng hơn "marketing", và làm thế nào để khách hàng nhớ đến bạn.',
    excerptEn: 'Why "authenticity" matters more than "marketing", and how to make customers remember you.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&auto=format&fit=crop&q=80',
    date: '2026-02-10',
    author: 'Uyen Nguyen',
    content: `Trong thời đại mà mọi thứ đều có thể được "marketing", điều gì làm nên sự khác biệt thực sự? Câu trả lời: Chính bạn.

## Thương hiệu không phải logo hay slogan

Nhiều người nghĩ thương hiệu là thiết kế logo đẹp, có slogan hay, mạng xã hội đẹp mắt. Không sai, nhưng đó chỉ là bề nổi.

Thương hiệu thực sự là:
- Câu chuyện của bạn
- Giá trị bạn mang lại
- Cảm xúc khách hàng có được khi đến với bạn
- Những gì người ta nói về bạn khi bạn không có mặt

## Câu chuyện của tôi: Từ thất bại đến bản sắc

Khi mới mở Memoire Saigon, tôi cố gắng làm "cho người Anh thích". Tôi điều chỉnh vị, giảm gia vị, tạo ra món ăn "an toàn". Kết quả? Quán vắng khách.

Rồi một ngày, tôi quyết định quay về gốc rễ. Tôi nấu món ăn Sài Gòn như chính tôi ăn ở nhà. Tôi kể câu chuyện về gia đình, về tuổi thơ, về những món ăn mà tôi nhớ.

Và thật kỳ diệu, khách hàng bắt đầu đến. Không chỉ người Việt, mà cả người Anh. Họ đến vì họ cảm nhận được sự chân thực.

## Làm thế nào để tìm bản sắc của riêng bạn?

**1. Quay về câu hỏi "Tại sao?"**
- Tại sao bạn vào nghề F&B?
- Tại sao khách hàng nên chọn bạn thay vì người khác?
- Điều gì làm bạn khác biệt?

**2. Đừng sợ hẹp niche**
Không thể làm hài lòng tất cả mọi người. Và đó là điều tốt. Khi bạn cố gắng thu hút tất cả, bạn sẽ không thu hút ai cả.

**3. Kể câu chuyện thật**
Khách hàng có thể cảm nhận được sự giả dối. Họ không muốn nghe những câu marketing sáo rỗng. Họ muốn kết nối với con người thật phía sau thương hiệu.

## Bản sắc tạo nên lòng trung thành

Khi bạn có bản sắc rõ ràng, khách hàng sẽ không chỉ đến vì món ăn. Họ đến vì họ tin tưởng bạn, họ kết nối với câu chuyện của bạn, họ muốn là một phần của hành trình đó.

Đó là sự khác biệt giữa "khách hàng" và "cộng đồng". Và đó là điều mà không có "marketing" nào mua được.`,
    contentEn: `In an era where everything can be "marketed", what makes the real difference? The answer: You yourself.

## Brand is not just logo or slogan

Many people think a brand is a beautiful logo design, catchy slogan, beautiful social media. Not wrong, but that's just the surface.

A real brand is:
- Your story
- The value you bring
- The emotions customers get when they come to you
- What people say about you when you're not there

## My story: From failure to authenticity

When I first opened Memoire Saigon, I tried to make it "for the British to like". I adjusted flavors, reduced spices, created "safe" dishes. Result? Empty restaurant.

Then one day, I decided to go back to my roots. I cooked Saigon food like I eat at home. I told stories about my family, my childhood, the dishes I miss.

And miraculously, customers started coming. Not just Vietnamese, but British too. They came because they felt the authenticity.

## How to find your own identity?

**1. Go back to the question "Why?"**
- Why did you enter the F&B industry?
- Why should customers choose you over others?
- What makes you different?

**2. Don't be afraid to niche down**
You can't please everyone. And that's good. When you try to attract everyone, you'll attract no one.

**3. Tell real stories**
Customers can sense fakeness. They don't want to hear empty marketing phrases. They want to connect with the real person behind the brand.

## Identity creates loyalty

When you have a clear identity, customers won't just come for the food. They come because they trust you, they connect with your story, they want to be part of that journey.

That's the difference between "customers" and "community". And that's something no "marketing" can buy.`
  },
  'from-failure-to-best-banh-mi': {
    title: 'Từ thất bại đến Best Bánh Mì Manchester',
    titleEn: 'From Failure to Best Bánh Mì in Manchester',
    excerpt: 'Câu chuyện phía sau giải thưởng và những gì tôi đã học được từ những lần vấp ngã.',
    excerptEn: 'The story behind the award and what I learned from falling down.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&auto=format&fit=crop&q=80',
    date: '2026-02-05',
    author: 'Uyen Nguyen',
    content: `"Best Bánh Mì in Manchester" - Giải thưởng mà nhiều người chúc mừng, nhưng ít ai biết những gì tôi đã trải qua để đến được đây.

## Khởi đầu với thất bại

Năm 2014, tôi mở nhà hàng đầu tiên với đầy tự tin. Tôi nghĩ mình biết mọi thứ. 18 tháng sau, tôi phải đóng cửa với món nợ khổng lồ và tâm trạng tồi tệ nhất trong đời.

Tôi thất bại vì:
- Không hiểu về quản lý tài chính
- Chọn sai địa điểm
- Không có kế hoạch rõ ràng
- Cố gắng làm quá nhiều thứ cùng lúc

## Bài học từ nước mắt

Thất bại đầu tiên dạy tôi nhiều hơn tất cả những thành công sau này. Tôi học được:

**1. Đơn giản hóa**
Không cần menu dài. Chỉ cần vài món làm thật tốt. Bánh mì là món tôi làm tốt nhất, vậy thì tập trung vào đó.

**2. Chi phí là vua**
Hiểu rõ từng đồng chi ra. Food cost, labor cost, overhead - không có gì không thể đo lường được.

**3. Địa điểm quan trọng hơn bạn nghĩ**
Món ăn ngon nhưng ở chỗ không ai đi qua thì vô dụng. Tôi đã học cách phân tích vị trí, footfall, demographic.

## Bắt đầu lại với Memoire Saigon

Với tất cả bài học đó, tôi mở Memoire Saigon vào năm 2019. Lần này:

- Menu chỉ tập trung vào bánh mì và vài món truyền thống
- Chọn địa điểm sau 3 tháng nghiên cứu kỹ lưỡng
- Có kế hoạch tài chính chi tiết cho 2 năm đầu
- Xây dựng team nhỏ nhưng chất lượng

## Con đường đến giải thưởng

"Best Bánh Mì in Manchester" không đến từ việc cố gắng giành giải thưởng. Nó đến từ việc:

- Làm bánh mì đúng cách mỗi ngày
- Lắng nghe phản hồi khách hàng
- Không ngừng cải thiện công thức
- Tôn trọng nguyên liệu và quy trình

## Thông điệp của tôi

Nếu bạn đang trong giai đoạn khó khăn, hãy nhớ: **Thất bại không phải là kết thúc**. Nó là bài học quan trọng nhất trên con đường thành công.

Hãy thất bại nhanh, học nhanh, và bắt đầu lại thông minh hơn. Đó là cách duy nhất để thành công trong ngành F&B.`,
    contentEn: `"Best Bánh Mì in Manchester" - An award many congratulated, but few knew what I went through to get here.

## Starting with failure

In 2014, I opened my first restaurant with full confidence. I thought I knew everything. 18 months later, I had to close with huge debt and the worst mood of my life.

I failed because:
- Didn't understand financial management
- Chose wrong location
- Had no clear plan
- Tried to do too many things at once

## Lessons from tears

My first failure taught me more than all subsequent successes. I learned:

**1. Simplify**
Don't need a long menu. Just a few dishes done really well. Bánh mì is what I do best, so focus on that.

**2. Cost is king**
Know every penny spent. Food cost, labor cost, overhead - nothing can't be measured.

**3. Location matters more than you think**
Good food in a place no one passes by is useless. I learned to analyze location, footfall, demographics.

## Starting again with Memoire Saigon

With all those lessons, I opened Memoire Saigon in 2019. This time:

- Menu focused only on bánh mì and a few traditional dishes
- Chose location after 3 months of thorough research
- Had detailed financial plan for first 2 years
- Built small but quality team

## The road to the award

"Best Bánh Mì in Manchester" didn't come from trying to win awards. It came from:

- Making bánh mì right every day
- Listening to customer feedback
- Constantly improving recipes
- Respecting ingredients and processes

## My message

If you're going through difficult times, remember: **Failure is not the end**. It's the most important lesson on the road to success.

Fail fast, learn fast, and start again smarter. That's the only way to succeed in the F&B industry.`
  }
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const currentLang = useLanguage();

  useEffect(() => {
    // In production, this would fetch from an API or CMS
    // For now, we use mock data
    setTimeout(() => {
      const foundPost = mockPostsData[slug];
      if (foundPost) {
        setPost(foundPost);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 300);
  }, [slug]);

  return (
    <>
      {loading ? (
        <div className="max-w-4xl mx-auto px-6 pt-24 md:pt-28 pb-12 text-center text-[#4a5c52]">
          {currentLang === 'vi' ? 'Đang tải...' : 'Loading...'}
        </div>
      ) : notFound || !post ? (
        <div className="max-w-4xl mx-auto px-6 pt-24 md:pt-28 pb-12 text-center">
          <h1 className="text-2xl font-bold font-serif text-[#083121] mb-4">
            {currentLang === 'vi' ? 'Không tìm thấy bài viết' : 'Post not found'}
          </h1>
          <Link href="/blog" className="text-[#fcc56c] hover:underline">
            ← {currentLang === 'vi' ? 'Quay lại Blog' : 'Back to Blog'}
          </Link>
        </div>
      ) : (
        <BlogContent post={post} />
      )}

    </>
  );
}
