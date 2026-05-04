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
    text: "以前洗澡会紧张发抖，这次护理师先陪它熟悉环境，吹毛也分段来。接回家毛很蓬，耳朵也清理得很干净。",
  },
  {
    name: "糯米 家长",
    pet: "英短 · 5 岁",
    text: "猫咪胆子小，店里安排了安静时段。全程有照片反馈，没有硬推项目，价格和预约时说的一样。",
  },
  {
    name: "豆包 家长",
    pet: "柯基 · 2 岁",
    text: "掉毛季做完 SPA 明显舒服很多，回家沙发上的浮毛少了。脚底毛和指甲修得很细，走路也不打滑了。",
  },
];

function App() {
  const [activeSlide, setActiveSlide] = useState(0);
  const currentSlide = heroSlides[activeSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % heroSlides.length);
    }, 5600);

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
        <div className="section-heading">
          <p className="eyebrow">Reviews</p>
          <h2>真实家长反馈</h2>
          <p>洗护不只看造型，也看宠物回家后的状态。这里是近期到店家长的体验记录。</p>
        </div>
        <div className="review-grid">
          {reviews.map((review) => (
            <article className="review-card" key={review.name}>
              <div className="stars" aria-label="五星评价">
                {[...Array(5)].map((_, index) => (
                  <Star key={index} size={18} fill="currentColor" />
                ))}
              </div>
              <p className="review-text">“{review.text}”</p>
              <div className="review-author">
                <span>{review.name}</span>
                <small>{review.pet}</small>
              </div>
            </article>
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
