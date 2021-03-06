<template>
  <div class="view-home">
    <section class="header">
      <div class="headline content">
        <div class="content-pad">
          <h1 class="page-title">Build something incredible today.</h1>
          <h3 class="page-title-sub">The Javascript CMS that front-end developers love.</h3>

          <div class="actions">
            <h3
              class="page-title-highlight"
            >🚀Launches March 17 - Join the developer group for early access.</h3>
            <factor-email-list list-id="alphaProgram" />
            <div v-if="!loadingButtons" class="github-actions">
              <script async defer src="https://buttons.github.io/buttons.js" />

              <a
                class="github-button"
                href="https://github.com/fiction-com/factor"
                data-color-scheme="no-preference: light; light: light; dark: light;"
                data-icon="octicon-star"
                data-size="large"
                data-show-count="true"
                aria-label="Star fiction-com/factor on GitHub"
              >Star on Github</a>
            </div>
          </div>
        </div>
      </div>

      <div class="content screencast-container">
        <div class="content-pad">
          <div class="screenshots">
            <div v-for="(s, i) in screenshots" :key="i" class="screenshot">
              <img :src="s.img" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="benefits content">
      <section-benefits class="content-pad" />
    </section>

    <section
      v-for="(feature, index) in features"
      :id="feature.id"
      :key="index"
      class="features content"
      :data-test="`feature-` + index"
      :class="[index == features.length - 1 ? 'last' : '']"
    >
      <div class="split-feature" :class="[index % 2 == 0 ? 'even' : 'odd']">
        <div class="feature-content-container">
          <div class="feature-content">
            <home-icon v-if="feature.icon" class="feature-icon" :icon="feature.icon" />
            <h2 class="title">{{ feature.title }}</h2>
            <div class="text">{{ feature.text }}</div>
            <div v-if="feature.link" class="action">
              <factor-link :path="feature.link.path">{{ feature.link.text }} &rarr;</factor-link>
            </div>
          </div>
        </div>
        <div class="feature-figure-container">
          <div v-if="feature.figure" class="figure-container">
            <component :is="feature.figure" />
          </div>
        </div>
      </div>
    </section>

    <div class="research-wrap">
      <div class="research-grid">
        <div class="point dev-time-traditional">
          <div class="timeline">
            <div class="big">5.5</div>
            <div class="descriptor">months</div>
          </div>
          <div class="about">*Estimated development time for a typical web app MVP</div>
        </div>

        <div class="point dev-time-factor">
          <div class="timeline">
            <div class="big">5</div>
            <div class="descriptor">days</div>
          </div>
          <div class="about">*Average time to develop and launch a custom Factor app</div>
        </div>
      </div>
    </div>

    <div class="quotes-wrap">
      <div class="quotes">
        <div class="quotes-pad">
          <article
            v-for="(quote, index) in quotes"
            :key="index"
            :class="[
              index % 2 == 0 ? 'odd' : 'even',
              index % 4 == 0 || index % 4 == 3 ? 'diagonal' : ''
            ]"
            itemprop="review"
            itemscope
            itemtype="http://schema.org/Review"
          >
            <blockquote itemprop="reviewRating" itemscope itemtype="http://schema.org/Rating">
              <div class="quote-media">
                <a class="quote-image" href="#">
                  <img :src="quote.img" alt="quote" />
                </a>
              </div>
              <p class="quote-body" itemprop="reviewBody">"{{ quote.text }}"</p>
              <div class="rating" itemprop="bestRating">
                <factor-icon icon="star" />
                <factor-icon icon="star" />
                <factor-icon icon="star" />
                <factor-icon icon="star" />
                <factor-icon icon="star" />
              </div>
              <footer>
                <a :href="quote.link" target="_blank">{{ quote.attribution }}</a>
              </footer>
            </blockquote>
          </article>
        </div>
      </div>
    </div>

    <div class="alpha-program content">
      <div class="content-pad">
        <div class="head">
          <div class="glyph">&alpha;</div>
          <h2 class="title">Join The Developer Program</h2>
          <h3 class="sub-title">Request an Invite or Contact Us</h3>
        </div>
        <div class="text">
          Join other developers building the next big things for
          the web. Join to get chat access, latest updates and support.
        </div>
        <div class="action">
          <factor-email-list list-id="alphaProgram" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { factorEmailList } from "@factor/plugin-email-list"
import { factorLink, factorIcon } from "@factor/ui"
import Vue from "vue"
export default Vue.extend({
  components: {
    factorEmailList,
    factorLink,
    factorIcon,

    "home-icon": () => import("./icon.vue"),
    "section-benefits": () => import("./section-benefits.vue")
  },
  data(this: any) {
    return {
      loading: true,
      loadingButtons: true,
      poster: require(`./img/screencast-poster.jpg`), // 1280x720,
      screenshots: [
        { img: require("./img/theme-ultra.jpg"), name: "Alpha Theme" },
        { img: require("./img/screencast-poster.jpg"), name: "Dashboard" },
        { img: require("./img/theme-alpha.jpg"), name: "Ultra Theme" }
      ],
      quotes: [
        {
          text: `Really enjoying @factordev! Brilliant design here, you can basically do everything with a plugin. #js #factordev`,
          attribution: "Justin Keller, CEO Elastic Byte",
          img: require("./img/elastic-byte.svg"),
          link: "https://www.elasticbyte.net"
        },
        {
          text: `wow! So impressed with the speed and ease of use of @factordev for creating universal #vuejs apps 💨 #factorjs`,
          attribution: "Nick Dryburgh, Zeno co.",
          img: require("./img/zeno.svg")
        }
      ],
      features: [
        {
          icon: "powered",
          title: "Stop worrying about your tools.",
          text: `When you use Factor you'll be using best-of-class open source software under the hood.
            Stop worrying about lock-in and making the right choice. No more endlessly comparing new tools and techniques.
            Just trust Factor and get started building your app.`,
          figure: () => import("./figure-powered-by.vue"),
          link: { path: "/guide/quickstart", text: "View Quickstart" }
        },
        {
          icon: "ssr",
          title: "Make apps that do more.",
          text: `Factor helps you bring together all the different tools you'll need to build great apps.
              It helps you build custom endpoints and easily optimize things for SEO,
             marketing, and performance.`,
          figure: () => import("./figure-live-changes.vue"),
          link: { path: "/guide", text: "Try Factor" }
        },
        {
          icon: "dashboard2",
          title: "Manage your users and content.",
          text: `Factor comes with a professional dashboard and post management system.
            This tool was carefully crafted to give you maximum powerful but with minimum bloat.
            It is simple by default but can be extended to handle even the most complex tasks.`,
          figure: () => import("./figure-dashboard.vue"),
          link: { path: "/guide", text: "Learn More" }
        },
        {
          id: "plugins-feature",

          title: `Add new features in seconds.`,
          text: `Most coding frameworks make you do way too much coding and customization
              to make plugins work. Factor focuses on making plugins dead simple with intelligent
              defaults. This means they "just work," no mandatory customization.`,
          figure: () => import("./figure-plugins.vue"),
          link: { path: "/plugins", text: "View Plugins" }
        },
        {
          title: "Save time with themes.",
          text: `Ever seen a theming system for Javascript apps that you could work with? We hadn't either.
              Factor was developed from the start with customizable theming and rapid app development in mind.`,
          figure: () => import("./figure-themes.vue"),
          link: { path: "/themes", text: "View Themes" }
        }
      ]
    }
  },
  mounted(this: any) {
    this.loadingButtons = false
  },
  methods: {},
  metaInfo() {
    return {
      title: "The Javascript CMS",
      description:
        "Factor Javascript (VueJS) CMS framework will help you build websites, blogs, and eCommerce. Built with Vue, Express, Node, MongoDb and natively Typescript."
    }
  }
})
</script>
<style lang="less">
.view-home {
  padding-top: 45px;

  overflow: hidden;
  .content-pad {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.5em;
    width: 100%;
    z-index: 10;
    position: relative;
  }

  .research-wrap {
    .research-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;

      margin: 0 auto;
      .point {
        padding: 8rem;
        .timeline {
          color: #0471ff;
        }
      }
      .point:last-child {
        .timeline {
          color: #0471ff;
        }
      }
    }
    .timeline {
      display: flex;

      line-height: 1;
      font-size: 2.5em;
      .big {
        font-size: 5em;
        font-weight: 700;
      }
      .descriptor {
        margin-top: 0.5em;
        opacity: 0.5;
      }
    }
    .about {
      opacity: 0.5;
      font-size: 1.2em;
    }
    @media (max-width: 1200px) {
      .research-grid {
        grid-template-columns: 1fr;

        .point {
          padding: 4rem;
        }
        .timeline {
          font-size: 2.5em;
          .big {
            font-size: 2em;
            font-weight: 700;
          }
          .descriptor {
            margin-top: 0;
          }
        }
      }
    }
  }

  /* HEADER */
  .header {
    .headline {
      padding: 6em 2em 2em;
      text-align: center;
      @media (min-height: 1000px) {
        padding-top: 170px;
      }
      h1 {
        z-index: 5;
        position: relative;
      }

      .page-title,
      .page-title-sub {
        letter-spacing: -0.025em;
      }

      .page-title {
        font-size: 3.7em;
        line-height: 1.1;
        font-weight: 600;
        margin-bottom: 1rem;

        .highlight {
          display: block;
          // color: var(--color-primary);
        }
        @media (max-width: 900px) {
          color: var(--color-primary);
          font-weight: 500;
          font-size: 2em;
          line-height: 1.1;
        }
      }

      .page-title-sub {
        font-size: 2em;
        opacity: 0.7;
      }

      @media (max-width: 900px) {
        text-align: left;
        padding: 3rem 0 0;
        .page-title {
          color: var(--color-primary);

          font-size: 2em;
          line-height: 1.1;
        }
        .page-title-sub {
          opacity: 1;
          font-size: 1.6em;
          line-height: 1.1;
        }
        .page-title .highlight {
          color: var(--color-primary);
        }
      }
      .actions {
        margin-top: 3em;
        .page-title-highlight {
          font-size: 1.1em;
          font-weight: 600;
          margin-bottom: 1em;
          opacity: 0.5;
        }
        .github-actions {
          margin: 2rem;
          display: flex;
          justify-content: center;
          align-items: center;
          line-height: 1;
          > span {
            margin: 0 0.5rem;
          }
          .github-link {
            color: inherit;

            opacity: 0.5;
            margin-left: 1rem;
          }
        }
      }
    }

    // .content {
    //   position: relative;
    //   z-index: 2;
    //   &:before {
    //     content: "";
    //     position: absolute;
    //     z-index: -1;
    //     left: 0;
    //     top: 126px;
    //     right: 0;
    //     bottom: -20px;
    //     transform: skewY(-10deg);
    //     background: linear-gradient(
    //       190deg,
    //       var(--color-bg-contrast),
    //       hsla(0, 0%, 100%, 0) 75%
    //     );
    //   }
    // }
    .screencast-container {
      position: relative;
      background-image: url("./img/dot.svg");

      .content-pad {
        max-width: 100%;
      }
      .screenshots {
        display: grid;
        grid-gap: 2rem;
        justify-content: center;
        align-items: center;
        grid-template-columns: repeat(3, minmax(370px, 600px));
        perspective: 1000px;
        width: 200%;
        margin-left: -50%;

        .screenshot {
          img {
            width: 100%;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1), 0 15px 35px rgba(0, 0, 0, 0.1),
              0 50px 100px rgba(50, 50, 93, 0.1);
          }
          &:nth-child(1) {
            transform: translateX(-30%);
          }
          &:nth-child(2) {
            z-index: 50;
          }
          &:nth-child(3) {
            transform: translateX(30%);
          }
        }
      }
      .screencast {
        width: 100%;
        padding-top: 56.25%;
        padding-top: calc(9 / 16 * 100%);
        position: relative;
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1), 0 15px 35px rgba(0, 0, 0, 0.1),
          0 50px 100px rgba(50, 50, 93, 0.1);
        background: #f6f9fc url(./img/screencast-poster.jpg) 50%/100%;
        background-size: contain;
        video {
          position: absolute;
          left: 0;
          top: 0;
          min-width: 100%;
          max-width: 100%;
          height: auto;
          border-radius: 7px;
        }
        .play-button {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          background: var(--color-text);
          opacity: 0.9;
          border-radius: 50%;
          box-shadow: 0 13px 27px -5px rgba(50, 50, 93, 0.25),
            0 8px 16px -8px rgba(0, 0, 0, 0.3), 0 -6px 16px -6px rgba(0, 0, 0, 0.025);
          width: 72px;
          height: 72px;
        }
      }
    }
  }

  .benefits {
    .content-pad {
      padding-top: 10rem;
      padding-bottom: 10rem;
      @media (max-width: 900px) {
        padding-top: 6rem;
        padding-bottom: 3rem;
      }
    }
  }

  .features {
    &.content {
      box-shadow: 0 1px 0 rgba(227, 228, 249, 1);
      &.last {
        box-shadow: none;
      }
      @media (max-width: 900px) {
        padding: 4rem 0;
        box-shadow: none;
      }
    }
    .split-feature {
      display: grid;
      grid-column-gap: 3rem;
      grid-template-columns: 1fr 1fr;
      grid-template-areas: "a b";
      align-items: center;
      min-height: 80vh;
      &.even {
        .feature-content-container {
          justify-self: flex-end;
        }
      }
      &.odd {
        grid-template-areas: "b a";
        .feature-figure-container {
          justify-content: flex-end;
          @media (max-width: 900px) {
            justify-content: center;
          }
        }
      }
      .feature-content-container {
        grid-area: a;
        min-width: 0;
        .feature-content {
          padding: 10rem 1.5rem;
          max-width: 550px;
        }
      }
      .feature-figure-container {
        grid-area: b;
        min-width: 0; // defaults content width
        height: 100%;
        position: relative;
        // width: 100%;
        display: flex;
        align-items: center;
        .figure-container {
          max-width: 100%;
        }
      }
      @media (max-width: 900px) {
        grid-template-columns: 1fr;
        grid-template-areas: "a" "b";
        &.odd {
          grid-template-areas: "a" "b";
        }
        .feature-content-container {
          .feature-content {
            padding: 3rem 1.5rem 1rem;
            max-width: 100%;
          }
        }
        .feature-figure-container {
          justify-content: center;
        }
      }
    }

    .feature-content {
      letter-spacing: -0.01em;
    }
    .feature-icon {
      height: 72px;
      width: 72px;
      margin-bottom: 1rem;
    }
    .title {
      font-weight: 500;
      font-size: 3em;
      line-height: 1.1;
      margin-bottom: 1.5rem;
    }
    .text {
      font-weight: 400;
      font-size: 1.4em;
      line-height: 1.6;
      margin-bottom: 1rem;
      opacity: 0.8;
    }
    .action {
      font-weight: 500;
      font-size: 1.3em;
    }
    @media (max-width: 900px) {
      .title {
        font-size: 1.8em;
      }
      .text {
        font-size: 1.1em;
      }
    }
  }

  .quotes-wrap {
    position: relative;
    background-image: url("./img/dot.svg");

    margin-top: 5em;
    .quotes {
      transform: skewY(-10deg);

      .quotes-pad {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 4em;
        perspective: 800px;
      }
      @media (max-width: 900px) {
        .quotes-pad {
          grid-template-columns: 1fr;
          article:nth-child(odd),
          article:nth-child(even) {
            transform: none;
            margin: 0 auto;
          }
          article {
            blockquote {
              padding: 4rem 2rem;
              text-align: left;
              .quote-media {
                text-align: left;
              }
            }
          }
        }
      }
      article {
        position: relative;
        display: flex;

        &:nth-child(odd) {
          transform: rotateX(2deg) rotateY(7deg);
          //    background-image: linear-gradient(45deg, #fff, #f7f7f7);
          blockquote {
            box-shadow: 1px 1px 4px 0 rgba(26, 26, 67, 0.1),
              -9px 22.5px 65px -5px rgba(50, 50, 93, 0.2);
          }
        }
        &:nth-child(even) {
          transform: rotateX(1deg) rotateY(-7deg);
          // background-image: linear-gradient(45deg, #fff, #f7f7f7);
          blockquote {
            box-shadow: 1px 1px 4px 0 rgba(26, 26, 67, 0.1),
              19px 22.5px 75px -5px rgba(50, 50, 93, 0.2);
          }
        }
        &.odd {
          justify-content: flex-end;
        }
        blockquote {
          transform: skewY(10deg);

          max-width: 550px;
          padding: 8rem 4rem;
          font-size: 1.4em;
          line-height: 1.8;
          text-align: center;
          background: #fff;
          border-radius: 6px;

          .quote-media {
            display: block;
            text-align: center;
            a {
              display: inline-block;
              width: 100px;

              img {
                display: block;
                width: 100%;
              }
            }

            margin-bottom: 1rem;
          }
          footer {
            margin-top: 1rem;
            text-transform: uppercase;

            font-size: 0.8em;
            font-weight: 500;
            // a {
            //   color: inherit;
            //   opacity: 0.4;
            // }
          }
        }
      }
    }
  }

  .alpha-program {
    text-align: center;
    padding: 6rem 0;
    .content-pad {
      max-width: 700px;
    }
    .glyph {
      color: #ff0076;

      width: 100px;
      height: 100px;
      line-height: 100px;
      font-size: 3.5em;

      border-radius: 50%;
      margin: 1rem auto;
    }
    line-height: 1.1;
    .title {
      font-size: 3em;
      font-weight: 500;
    }
    .sub-title {
      font-size: 2em;
      opacity: 0.8;
      // color: var(--color-primary);
    }
    .text,
    .action {
      font-size: 1.3em;
    }
    .text {
      line-height: 1.5;
      margin: 2rem 0;
    }
    .action {
      font-weight: 500;
    }
    .email-list-form .add-email {
      grid-template-columns: 1fr;
    }
    @media (max-width: 900px) {
      text-align: left;
      padding: 7rem 0;
      .title {
        font-size: 2em;
      }
      .glyph {
        margin: 0;
      }
    }
  }

  // .section-title {
  //   font-size: 3em;
  //   line-height: 1.1;

  //   @media (max-width: 670px) {
  //     font-size: 2em;
  //     line-height: 1.2;
  //   }
  // }
  // .body-title {
  //   font-weight: 500;
  //   font-size: 1.35em;
  //   line-height: 1.5em;
  // }
  // .body-text {
  //   font-weight: 400;

  //   opacity: 0.85;
  // }
  // .section-title-highlight {
  //   font-weight: 300;
  //   color: var(--color-primary);
  // }
  // .medium-body-text {
  //   font-weight: 400;
  //   font-size: 1.3em;
  //   line-height: 1.6;
  // }
}
</style>
