import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Bath,
  CalendarCheck,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  HeartHandshake,
  MapPin,
  PawPrint,
  Scissors,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import heroCatCare from "./assets/hero-cat-care.png";
import heroDogSpa from "./assets/hero-dog-spa.png";
import storeMapYichuan from "./assets/store-map-yichuan.png";
import "./styles.css";

const services = [
  {
    icon: Bath,
    title: "基础香波洗护",
    price: "¥88 起",
    text: "温和清洁、吹干梳毛、耳眼护理，适合日常焕新。",
  },
  {
    icon: Scissors,
    title: "造型精修",
    price: "¥168 起",
    text: "按品种与毛量定制造型，修脸、修脚、局部精细护理。",
  },
  {
    icon: Sparkles,
    title: "SPA 深层护理",
    price: "¥228 起",
    text: "泥膜护理、护毛素、除浮毛，改善打结与毛发干涩。",
  },
];

const heroSlides = [
  {
    image: heroDogSpa,
    alt: "干净明亮的宠物洗护店内，洗护后的狗狗坐在护理区",
    eyebrow: "犬只洗护 · 造型精修",
    title: "从蓬松毛发到清爽脚垫，狗狗洗护一步到位",
    text: "适配小型犬、中大型犬和掉毛季护理，洗前评估毛结和皮肤状态，洗后交付护理记录。",
  },
  {
    image: heroCatCare,
    alt: "安静舒适的猫咪护理空间，洗护后的猫咪放松坐着",
    eyebrow: "猫咪护理 · 安静时段",
    title: "胆小猫也能慢慢来，轻柔洗护更安心",
    text: "猫犬分时段接待，减少环境刺激。护理师按猫咪耐受程度控制流程，不强行赶时间。",
  },
];

const process = ["入店体检", "温和洗护", "造型修剪", "香氛交付"];

const reviews = [
  {
    name: "Lucky 家长",
    pet: "比熊 · 3 岁",
    service: "基础香波洗护",
    text: "以前洗澡会紧张发抖，这次护理师先陪它熟悉环境，吹毛也分段来。接回家毛很蓬，耳朵也清理得很干净。",
  },
  {
    name: "糯米 家长",
    pet: "英短 · 5 岁",
    service: "猫咪安静时段",
    text: "猫咪胆子小，店里安排了安静时段。全程有照片反馈，没有硬推项目，价格和预约时说的一样。",
  },
  {
    name: "豆包 家长",
    pet: "柯基 · 2 岁",
    service: "SPA 深层护理",
    text: "掉毛季做完 SPA 明显舒服很多，回家沙发上的浮毛少了。脚底毛和指甲修得很细，走路也不打滑了。",
  },
  {
    name: "奶茶 家长",
    pet: "金毛 · 4 岁",
    service: "大型犬洗护",
    text: "金毛毛量大，之前每次洗完都要很久才干。这次吹得很透，护毛味道也很清爽，第二天摸起来还是蓬松的。",
  },
  {
    name: "奥利奥 家长",
    pet: "雪纳瑞 · 6 岁",
    service: "造型精修",
    text: "修脸很有耐心，没有把胡子剪得太短，整体看起来精神很多。护理师还提醒了耳道日常清洁的方法，很贴心。",
  },
  {
    name: "芝麻 家长",
    pet: "布偶 · 2 岁",
    service: "猫咪轻柔梳洗",
    text: "布偶容易打结，店里先把结慢慢梳开，没有直接剃掉。回家后情绪很稳定，也没有一直舔毛抗拒。",
  },
  {
    name: "可乐 家长",
    pet: "泰迪 · 8 岁",
    service: "老年犬舒缓护理",
    text: "狗狗年纪大了站久会累，护理师中途让它休息了几次。洗完没有疲惫感，脚垫也修得很干净。",
  },
  {
    name: "元宝 家长",
    pet: "柴犬 · 3 岁",
    service: "除浮毛护理",
    text: "柴犬换毛期太夸张了，做完除浮毛护理以后家里轻松很多。护理记录写得清楚，知道下次该什么时候再来。",
  },
  {
    name: "小满 家长",
    pet: "约克夏 · 1 岁",
    service: "幼宠首次洗护",
    text: "第一次到店本来担心会害怕，结果护理师一直轻声安抚，还把每一步都发给我看。小满回家后很放松。",
  },
];

const reviewPages = reviews.reduce((pages, review, index) => {
  const pageIndex = Math.floor(index / 3);
  if (!pages[pageIndex]) {
    pages[pageIndex] = [];
  }
  pages[pageIndex].push(review);
  return pages;
}, []);

function App() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeReviewPage, setActiveReviewPage] = useState(0);
  const currentSlide = heroSlides[activeSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % heroSlides.length);
    }, 5600);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveReviewPage((index) => (index + 1) % reviewPages.length);
    }, 4800);

    return () => window.clearInterval(timer);
  }, []);

  const goToSlide = (direction) => {
    setActiveSlide((index) => {
      if (direction === "previous") {
        return (index - 1 + heroSlides.length) % heroSlides.length;
      }

      return (index + 1) % heroSlides.length;
    });
  };

  const goToReviewPage = (direction) => {
    setActiveReviewPage((index) => {
      if (direction === "previous") {
        return (index - 1 + reviewPages.length) % reviewPages.length;
      }

      return (index + 1) % reviewPages.length;
    });
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="爪爪焕新首页">
          <span className="brand-mark">
            <PawPrint size={22} />
          </span>
          <span>爪爪焕新</span>
        </a>
        <nav aria-label="主导航">
          <a href="#services">服务</a>
          <a href="#reviews">评价</a>
          <a href="#store">店面</a>
          <a href="#process">流程</a>
          <a href="#booking">预约</a>
        </nav>
      </header>

      <section className="hero" id="top">
        {heroSlides.map((slide, index) => (
          <img
            className={`hero-image ${index === activeSlide ? "is-active" : ""}`}
            src={slide.image}
            alt={slide.alt}
            key={slide.alt}
          />
        ))}
        <div className="hero-overlay" />
        <div className="hero-content">
          <p className="eyebrow">{currentSlide.eyebrow}</p>
          <h1>{currentSlide.title}</h1>
          <p className="hero-copy">
            {currentSlide.text}
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#booking">
              立即预约 <ChevronRight size={18} />
            </a>
            <a className="ghost-button" href="#services">查看套餐</a>
          </div>
        </div>
        <div className="carousel-controls" aria-label="轮播切换">
          <button type="button" onClick={() => goToSlide("previous")} aria-label="上一张">
            <ChevronLeft size={20} />
          </button>
          <div className="carousel-dots" aria-label="当前轮播图">
            {heroSlides.map((slide, index) => (
              <button
                type="button"
                className={index === activeSlide ? "is-active" : ""}
                onClick={() => setActiveSlide(index)}
                aria-label={`切换到第 ${index + 1} 张`}
                key={slide.alt}
              />
            ))}
          </div>
          <button type="button" onClick={() => goToSlide("next")} aria-label="下一张">
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      <section className="trust-strip" aria-label="门店亮点">
        <div>
          <ShieldCheck size={22} />
          <span>一宠一消毒</span>
        </div>
        <div>
          <Clock3 size={22} />
          <span>最快 90 分钟交付</span>
        </div>
        <div>
          <HeartHandshake size={22} />
          <span>敏感宠物慢速安抚</span>
        </div>
        <div>
          <Star size={22} />
          <span>4.9 分门店好评</span>
        </div>
      </section>

      <section className="section services-section" id="services">
        <div className="section-heading">
          <p className="eyebrow">Services</p>
          <h2>常用洗护套餐</h2>
          <p>价格会根据体型、毛量、打结程度微调，到店前先沟通，护理中不临时加价。</p>
        </div>
        <div className="service-grid">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <article className="service-card" key={service.title}>
                <div className="service-icon">
                  <Icon size={26} />
                </div>
                <h3>{service.title}</h3>
                <strong>{service.price}</strong>
                <p>{service.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section reviews-section" id="reviews">
        <div className="reviews-header">
          <div className="section-heading">
            <p className="eyebrow">Reviews</p>
            <h2>真实家长反馈</h2>
            <p>洗护不只看造型，也看宠物回家后的状态。这里是近期到店家长的体验记录。</p>
          </div>
          <div className="review-controls" aria-label="评价轮播切换">
            <button type="button" onClick={() => goToReviewPage("previous")} aria-label="上一组评价">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => goToReviewPage("next")} aria-label="下一组评价">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="review-carousel">
          <div
            className="review-track"
            style={{ transform: `translateX(-${activeReviewPage * 100}%)` }}
          >
            {reviewPages.map((page, pageIndex) => (
              <div className="review-page" key={`review-page-${pageIndex}`}>
                {page.map((review) => (
                  <article className="review-card" key={review.name}>
                    <div className="review-card-top">
                      <div className="stars" aria-label="五星评价">
                        {[...Array(5)].map((_, index) => (
                          <Star key={index} size={18} fill="currentColor" />
                        ))}
                      </div>
                      <span>{review.service}</span>
                    </div>
                    <p className="review-text">“{review.text}”</p>
                    <div className="review-author">
                      <span>{review.name}</span>
                      <small>{review.pet}</small>
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="review-dots" aria-label="评价页码">
          {reviewPages.map((page, index) => (
            <button
              type="button"
              className={index === activeReviewPage ? "is-active" : ""}
              onClick={() => setActiveReviewPage(index)}
              aria-label={`切换到第 ${index + 1} 组评价`}
              key={`review-dot-${page[0].name}`}
            />
          ))}
        </div>
      </section>

      <section className="section store-section" id="store">
        <div className="store-copy">
          <p className="eyebrow">Store</p>
          <h2>店面信息</h2>
          <p>
            门店采用猫犬分区护理和预约制接待，减少宠物等待时间。到店前可先发送宠物照片，
            护理师会提前评估毛量、打结和敏感护理需求。
          </p>
          <div className="store-list">
            <div>
              <MapPin size={20} />
              <span>上海市宜川路街道陕西北路1620号</span>
            </div>
            <div>
              <Clock3 size={20} />
              <span>周一至周日 10:00-21:00</span>
            </div>
            <div>
              <CalendarCheck size={20} />
              <span>预约电话 400-880-6618</span>
            </div>
          </div>
        </div>
        <aside className="store-panel" aria-label="门店设施">
          <div className="store-map">
            <img src={storeMapYichuan} alt="陕西北路1620号附近的可爱宠物店风格地图" />
            <div className="map-marker" aria-hidden="true">
              <MapPin size={28} fill="currentColor" />
            </div>
            <div className="store-map-badge">
              <MapPin size={20} />
              <div>
                <strong>爪爪焕新 Pet Spa</strong>
                <span>上海市宜川路街道陕西北路1620号</span>
              </div>
            </div>
          </div>
          <div className="facility-grid">
            <span>猫咪安静间</span>
            <span>犬只洗护区</span>
            <span>可视吹干台</span>
            <span>用品消毒柜</span>
          </div>
        </aside>
      </section>

      <section className="feature-band" id="process">
        <div className="feature-image">
          <img
            src="https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80"
            alt="宠物美容师为狗狗护理毛发"
          />
        </div>
        <div className="feature-copy">
          <p className="eyebrow">Care Flow</p>
          <h2>把护理过程做得透明一点，宠物就会放松一点</h2>
          <p>
            每只宠物入店先做皮肤、耳道、趾甲和毛结检查。护理师会记录宠物情绪和敏感点，
            洗护过程避开强刺激香精，吹风强度也会按耐受程度调整。
          </p>
          <div className="process-list">
            {process.map((item, index) => (
              <div className="process-item" key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section booking-section" id="booking">
        <div className="booking-copy">
          <p className="eyebrow">Booking</p>
          <h2>今天想给谁洗香香？</h2>
          <p>留下基础信息，门店会在 10 分钟内确认时间、宠物状态和预估价格。</p>
          <ul>
            <li><Check size={18} /> 猫犬分时段接待</li>
            <li><Check size={18} /> 可提前备注怕水、怕吹风、皮肤敏感</li>
            <li><Check size={18} /> 到店前发送准备清单</li>
          </ul>
        </div>
        <form className="booking-form">
          <label>
            宠物名字
            <input type="text" placeholder="例如：奶糖" />
          </label>
          <label>
            宠物类型
            <select defaultValue="">
              <option value="" disabled>请选择</option>
              <option>小型犬</option>
              <option>中大型犬</option>
              <option>猫咪</option>
            </select>
          </label>
          <label>
            预约日期
            <input type="date" />
          </label>
          <label>
            联系电话
            <input type="tel" placeholder="用于确认预约" />
          </label>
          <button type="button">
            <CalendarCheck size={19} />
            提交预约
          </button>
        </form>
      </section>

      <footer>
        <div>
          <strong>爪爪焕新 Pet Spa</strong>
          <p><MapPin size={16} /> 上海市宜川路街道陕西北路1620号</p>
        </div>
        <p>营业时间 10:00-21:00 · 预约电话 400-880-6618</p>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
