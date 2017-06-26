import { TweenMax, TimelineMax, Power0, Power1, Power2, Back } from 'gsap';
import requestAnimationFrame from 'raf';
import './less/index.less';

const $ = window.$;
const T = TweenMax;
const Tl = TimelineMax;

const getTime = Date.now || (() => new Date().getTime());

const webConfig = [
  {
    name: 'H', frame: 35, loopFrame: 18,
    other: '<div class="ladder"></div><div class="h-other-0"></div><div class="h-other-1"></div>'
  },
  { name: 'Z', frame: 33, loopFrame: 14 },
  {
    name: 'M', frame: 14, other: `
      <div class="img-loop"></div>
      <div class="m-other-0"></div>
      <div class="m-other-1"></div>
      <div class="m-other-2"></div>
    `
  },
  { name: 'I', frame: 15, other: '<div class="i-other-0"></div>' },
  { name: 'X', frame: 33, loopFrame: 14, }
];

const imgLoadUrl = [
  'h_0.png', 'h_1.png', 'H_1x.png', 'I_1x.png', 'ladder.png', 'logo.png', 'm_0.png', 'm_1.png',
  'M_1x.png', 'M_loop_1x.png', 'slogan.png', 'title0.png', 'title1.png', 'title2.png', 'title3.png', 'Z_1x.png'
];

const perFrame = 100;

const scrollTop = [0, -603, -1100, -1500, -2050];

class AnimateDemo {
  height = 603;
  animateEnd = {};

  animateQueue = [];

  lastUpdate = getTime();

  elapsed = 0;

  loadNum = 0;

  loadBar = $('.load-bar');

  root = $('#__root-content');

  footer = $('#footer');

  header = $('header');

  scrollNum = 0;

  webDoms = [];

  constructor() {
    this.init();
    this.load();
    this.ticker();
    // T.ticker.addEventListener('tick', this.ticker);
    $(window).on('scroll', (e) => {
      e.preventDefault();
    });
  }

  newImage = (src) => {
    const img = new Image();
    img.src = src;
    img.onload = img.onerror = this.loadEnd;
  };

  load = () => {
    imgLoadUrl.forEach(key => {
      let src = `/image/${key}`;
      this.newImage(src);
    });
  };

  loadEnd = () => {
    this.loadNum++;
    this.loadBar.css({ transform: `translateX(${(this.loadNum / imgLoadUrl.length - 1) * 100}%)` });
    if (this.loadNum >= imgLoadUrl.length) {
      setTimeout(() => {
        $('.load-wrapper').css({ opacity: 0 });
        setTimeout(() => {
          $('.load-wrapper').remove();
        }, 600);
        $('header').css({ opacity: 1 });
        this.animateStart(this.scrollNum);
      }, 450);
    }
  };

  ticker = () => {
    this.elapsed = getTime() - this.lastUpdate;
    if (this.elapsed >= perFrame) {
      this.lastUpdate += this.elapsed;
      this.animateQueue.forEach((item, i) => {
        if (item.paused) {
          return;
        }
        let num = item.num;
        if (item.config.start && item.num < item.config.start) {
          return item.num++;
        } else if (item.config.start) {
          item.image.css({ opacity: 1 });
          num = num - (item.config.start || 0);
        }
        const x = -(num % 5) * 375;
        const y = -Math.floor(num / 5) * 540;
        item.image.css({ backgroundPosition: `${x}px ${y}px` });
        item.num++;
        this.animateEnd[item.i] = true;
        const config = item.config;
        if (item.num >= config.frame) {
          if (config.loopFrame) {
            item.num = config.loopFrame;
          } else {
            this.animateQueue.splice(i, 1);
          }
        }
      });
    }
    requestAnimationFrame(this.ticker.bind(this));
  }

  init() {
    this.webDoms = webConfig.map((item, i) => {
      return $(`<div class='content content${i}'>
       <div class="title-wrapper">
         <p class="slogan"/>
         <p class="title"/>
       </div>
       <div class="img-wrapper">
         <div class="img" style="background-position: 0 0;"/>
         ${item.other || ''}
       </div>
     </div>`).appendTo($('#__root-content'));
    });
    window.addEventListener('touchstart', this.touchStart);
    window.addEventListener("touchmove", this.touchMove);
  }

  touchStart = (e) => {
    const targetTouches = e.targetTouches[0];
    this.scrollStart = targetTouches.clientY;
  };

  touchMove = (e) => {
    e.preventDefault();
    const targetTouches = e.targetTouches[0];
    const scrollEnd = targetTouches.clientY;
    const differ = scrollEnd - this.scrollStart;
    const height = this.root.height();

    if (Math.abs(differ) > 30 && typeof this.scrollStart === 'number') {
      if (differ > 0) {
        this.scrollNum--;
      } else {
        this.scrollNum++;
      }
      const maxNum = webConfig.length;
      if (this.scrollNum <= 0) {
        this.scrollNum = 0;
      } else if (this.scrollNum >= maxNum) {
        this.scrollNum = maxNum;
      }
      if (this.scrollNum === 0) {
        this.header.css({ opacity: 1 });
      } else {
        this.header.css({ opacity: 0 });
      }

      this.scrollStart = null;

      if (this.scrollNum === maxNum) {
        this.isFooter = true;
        this.footer.css({ transform: 'translateY(0%)' });
        return;
      } else if (this.isFooter) {
        this.footer.css({ transform: 'translateY(100%)' });
        this.isFooter = false;
      }

      this.root.css({ transform: `translate3d(0, ${scrollTop[this.scrollNum]}px, 0)` });
      setTimeout(() => {
        /*this.animateQueue = this.animateQueue.map(item => {
         if (item.i !== this.scrollNum) {
         item.paused = true;
         } else {
         item.paused = false;
         }
         return item;
         });*/
        if (!this.animateEnd[this.scrollNum] && this.scrollNum >= 0) {
          this.animateStart(this.scrollNum);
        }
      }, 100);

    }
  }

  hOtherEnd = () => {
    const ladder = $('.ladder');
    const h0 = $('.h-other-0');
    const h1 = $('.h-other-1');
    const tl = new Tl({ delay: 1 });
    tl.add(T.to(ladder, .45, { opacity: 1 }));
    tl.add(T.to(h0, .45, {
      scale: 1, onComplete: () => {
        T.to(h0, 4, { y: 15, repeat: -1, yoyo: true, ease: Power1.easeInOut });
      },
      ease: Back.easeOut
    }));
    tl.add(T.to(h1, .45, {
      scale: 1, onComplete: () => {
        T.to(h1, 4, { y: -15, repeat: -1, yoyo: true, ease: Power1.easeInOut });
      },
      ease: Back.easeOut,
    }), .6)
  };

  mOtherEnd = () => {
    const m0 = $('.m-other-0');
    const m1 = $('.m-other-1');
    const m2 = $('.m-other-2');
    T.to(m0, .45, { delay: 1, opacity: 1 });
    const tl = new Tl({ delay: 1, repeat: -1 });
    tl.add(T.to(m1, .45, { opacity: 1 }));
    tl.add(T.to(m1, 3, { y: 300, ease: Power0.easeNone }), 0);
    const tl2 = new Tl({ delay: 2.5, repeat: -1 });
    tl2.add(T.to(m2, .45, { opacity: 1 }));
    tl2.add(T.to(m2, 3, { y: 300, ease: Power0.easeNone }), 0);
  };

  iOtherEnd = () => {
    const m0 = $('.i-other-0');
    T.to(m0, .45, { delay: 1, opacity: 1 });
  }

  animateStart(i) {
    const dom = this.webDoms[i];
    let image = dom.find('.img-wrapper .img');
    const webC = webConfig[i];
    dom.find('.title-wrapper').css({ opacity: 1 });

    switch (i) {
      case 0:
        this.hOtherEnd();
        break;
      case 2:
        this.mOtherEnd();
        break;
      case 3:
        this.iOtherEnd();
        break;
    }

    this.animateQueue.push({
      image,
      i,
      config: webC,
      num: 0,
    });

    if (webC.loopImg) {
      image = dom.find('.img-wrapper .img-loop');
      this.animateQueue.push({
        image,
        i,
        config: webC.loopImg,
        num: 0,
      })
    }

  }
}

$(() => {
  new AnimateDemo();
  const audio = document.getElementById('music');
  audio.play();
  document.addEventListener("WeixinJSBridgeReady", function () {
    audio.play();
  }, false);
});