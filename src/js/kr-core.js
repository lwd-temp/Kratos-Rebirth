/**
 * 一些暴露给 DOM 交互使用的全局函数
 */

window.copyCode =
  window.copyCode ||
  function (triggerBtn, targetCodeID) {
    // 用了 navigator.clipboard API ，不要再用老依赖和写法了
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/clipboard
    const targetCodeElement = document.getElementById(targetCodeID);
    if (targetCodeElement) {
      const code = targetCodeElement.innerText;
      navigator.clipboard.writeText(code);

      // 复制成功，庆祝一下
      const origInner = triggerBtn.innerHTML;
      triggerBtn.innerHTML = `<i class="fa fa-check-circle"></i>&nbsp;成功~`;
      setTimeout(() => {
        triggerBtn.innerHTML = origInner;
      }, 3000);
    }
    // 并且这样复制不会触发 CC 提示，就不用担心代码被提示弄出一堆错了
  };

/**
 * 核心的配置体，包一层防止全局变量命名导致的冲突
 */

(() => {
  const loadConfig = async () => {
    const url = (window.kr?.siteRoot || "/") + "config.json";
    return await fetch(url).then((res) => res.json());
  };
  const initPpageScrollDown = () => {
    let isScrolledDown = false;
    const pageScrollDownClass = () => {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 200) {
          if (!isScrolledDown) {
            document.body.classList.add("scroll-down");
            isScrolledDown = true;
          }
        } else {
          if (isScrolledDown) {
            document.body.classList.remove("scroll-down");
            isScrolledDown = false;
          }
        }
      });
    };
    document.getElementById("gotop-box").addEventListener("click", (e) => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    });
    pageScrollDownClass();
    window.addEventListener("scroll", pageScrollDownClass);
  };

  // 构建移动端的侧边展开导航
  const initOffcanvas = () => {
    const menuWrapClone = document
      .getElementById("kratos-menu-wrap")
      .cloneNode(true);
    menuWrapClone.setAttribute("id", "offcanvas-menu");
    menuWrapClone.querySelectorAll("ul").forEach((el) => {
      el.removeAttribute("id");
      el.classList.add("ul-me");
    });
    menuWrapClone.style.height = "calc(100% - 60px)";
    menuWrapClone.style.right = "-240px";

    document
      .getElementById("kratos-nav-toggle")
      .addEventListener("click", () => {
        const navToggleWrapper = document.getElementById(
          "kratos-nav-toggle-wrapper",
        );
        if (navToggleWrapper.classList.contains("toon")) {
          navToggleWrapper.classList.remove("toon");
          menuWrapClone.style.right = "-240px";
        } else {
          navToggleWrapper.classList.add("toon");
          menuWrapClone.style.right = "0px";
        }
      });

    document.getElementById("kratos-page").prepend(menuWrapClone);

    // 在页面放大到超过断点时自动关闭
    window.addEventListener("resize", (e) => {
      const navToggleWrapper = document.getElementById(
        "kratos-nav-toggle-wrapper",
      );

      if (window.innerWidth > 768) {
        // 关闭
        if (navToggleWrapper.classList.contains("toon")) {
          navToggleWrapper.classList.remove("toon");
          menuWrapClone.style.right = "-240px";
        }
      }
    });
  };
  const collapseBoxControl = () => {
    const collapseBoxes = document
      .querySelectorAll(".collapse-box-control")
      .forEach((node) => {
        node
          .querySelector(".collapse-box-header")
          ?.addEventListener("click", (e) => {
            node.classList.toggle("active");
          });
      });
  };

  const viewerJsInit = (kr) => {
    if (kr.enable) {
      const postEntry = document.getElementsByClassName("kratos-page-content");
      if (postEntry.length > 0) {
        new Viewer(postEntry[0]);
      }
    }
  };

  let copyrightString;
  const initCopyrightNotice = (kr) => {
    copyrightString = kr.template
      .replaceAll("$NEWLINE", "\n")
      .replaceAll(
        "$AUTHOR",
        document.querySelector("meta[name='author']").getAttribute("content"),
      )
      .replaceAll("$TITLE", document.title)
      .replaceAll("$LINK", window.location.href);
  };

  const initCopyEventListener = (kr) => {
    if (kr.enable) {
      document.body.oncopy = (e) => {
        if (copyrightString) {
          const copiedContent = window.getSelection().toString();
          if (copiedContent.length > kr.threshold) {
            e.preventDefault();
            if (e.clipboardData) {
              e.clipboardData.setData(
                "text/plain",
                copiedContent + copyrightString,
              );
            }
          }
        }
      };
    }
  };

  let docTitle = "";
  const saveTitle = () => {
    docTitle = document.title;
  };

  const initInactiveNotice = (kr) => {
    if (kr.enable) {
      let titleTime;
      const siteFavicon = document.querySelector('[rel="icon"]');
      const originIcon = siteFavicon.getAttribute("href");
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          document.title = kr.leaveTitle;
          if (kr.leaveLogo) {
            siteFavicon.setAttribute("href", kr.leaveLogo);
          }
          clearTimeout(titleTime);
        } else {
          document.title = kr.returnTitle + " " + docTitle;
          if (kr.leaveLogo) {
            siteFavicon.setAttribute("href", originIcon);
          }
          titleTime = setTimeout(() => {
            document.title = docTitle;
            titleTime = 0;
          }, 2000);
        }
      });
    }
  };

  const getTimeString = (msec, exact = true) => {
    let tString;
    const sec = msec / 1000;
    const dnum = Math.floor(sec / 60 / 60 / 24);
    const hnum = Math.floor(sec / 60 / 60 - 24 * dnum);
    const mnum = Math.floor(sec / 60 - 24 * 60 * dnum - 60 * hnum);
    const snum = Math.floor(
      sec - 24 * 60 * 60 * dnum - 60 * 60 * hnum - 60 * mnum,
    );
    let dstr = dnum.toString();
    let hstr = hnum.toString();
    let mstr = mnum.toString();
    let sstr = snum.toString();
    if (exact) {
      if (dstr && dstr.length === 1) {
        dstr = "0" + dstr;
      }
      if (hstr && hstr.length === 1) {
        hstr = "0" + hstr;
      }
      if (mstr && mstr.length === 1) {
        mstr = "0" + mstr;
      }
      if (sstr && sstr.length === 1) {
        sstr = "0" + sstr;
      }
      tString = dstr + "天" + hstr + "小时" + mstr + "分" + sstr + "秒";
    } else {
      // 大概值
      if (dnum < 540) {
        // 一年半内
        if (dnum < 60) {
          // 两个月内
          tString = dstr + "天";
        } else {
          // 年内月外
          tString = Math.floor(dnum / 30).toString() + "个月";
        }
      } else {
        // 年外
        tString = Math.floor(dnum / 365).toString() + "年";
      }
    }
    return tString;
  };

  const initUpTime = (kr) => {
    const createTime = new Date(kr.since);
    const upTimeNode = document.getElementById("kr-since");
    setInterval(() => {
      upTimeNode.innerText = getTimeString(Date.now() - createTime);
    }, 1000);
  };

  const codeCopyInit = () => {
    const codeFigures = document.querySelectorAll("figure.highlight");
    codeFigures.forEach((figure, count) => {
      figure
        .getElementsByTagName("table")[0]
        .getElementsByTagName("tbody")[0]
        .getElementsByTagName("tr")[0]
        .getElementsByClassName("code")[0]
        .setAttribute("id", `code-${count}`);

      figure.innerHTML += `<button class="copy" onclick="copyCode(this, 'code-${count}')">
                <i class="fa fa-copy"></i>&nbsp;复制
            </button>`;
    });
  };

  const commentsLazyLoad = () => {
    // 检查当前是否在浏览器中运行
    const runningOnBrowser = typeof window !== "undefined";

    // 通过检查 scroll 事件 API 和 User-Agent 来匹配爬虫
    const isBot =
      (runningOnBrowser && !("onscroll" in window)) ||
      (typeof navigator !== "undefined" &&
        /(gle|ing|ro|msn)bot|crawl|spider|yand|duckgo/i.test(
          navigator.userAgent,
        ));

    // 检查当前浏览器是否支持 IntersectionObserver API
    const supportsIntersectionObserver =
      runningOnBrowser && "IntersectionObserver" in window;

    // 需要懒加载的评论区块
    const lazyloadCommentsArea = document.querySelector(
      ".kr-comments.lazy-load",
    );

    // 加载评论的函数
    const loadwork = () => {
      if (window.loadCommentsEventHandler) {
        // 取消上一个加载事件
        window.cancelIdleCallback(window.loadCommentsEventHandler);
      }

      // 尝试调用 loadComments 函数来懒加载评论
      if (typeof window.loadComments !== "function") {
        // 不是函数，跳过
        return;
      }
      // 加载新评论模块
      window.loadCommentsEventHandler = window.requestIdleCallback(
        window.loadComments,
      );
      // 防止二次加载，清理掉函数
      window.loadComments = null;
    };

    // 检查是否可以懒加载
    if (
      runningOnBrowser &&
      !isBot &&
      supportsIntersectionObserver &&
      lazyloadCommentsArea
    ) {
      // 支持懒加载
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadwork();
            observer.disconnect();
          }
        },
        { threshold: 0 },
      );
      observer.observe(lazyloadCommentsArea);
    } else {
      // 不支持懒加载，就直接加载了
      loadwork();
    }

    // 在 pjax 前清理掉遗留的加载函数，避免被错误调用
    window.addEventListener(
      "pjax:before",
      () => {
        if (window.loadComments) {
          window.loadComments = null;
        }
      },
      { once: true },
    );
  };

  const checkExpireNotify = (kr) => {
    if (kr.expireAfter) {
      const expireAlert = document.getElementById("expire-alert");
      if (expireAlert) {
        const dateTimeTag = expireAlert.querySelector("time");
        const updateDateTime = new Date(
          parseInt(dateTimeTag.getAttribute("datetime")),
        );
        const nowDateTime = Date.now();
        const gap = nowDateTime - updateDateTime;
        if (gap > kr.expireAfter * 24 * 3600 * 1000) {
          // 内容可能过期，需要提示
          dateTimeTag.innerText = getTimeString(gap, false);
          expireAlert.classList.remove("hidden");
        }
      }
    }
  };

  const makeDelay = (callback, ms) => {
    let timer = 0;
    return function () {
      let context = this,
        args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        callback.apply(context, args);
      }, ms || 0);
    };
  };

  const tocWidgetAnimInit = () => {
    const sidebarTocWidget = document.getElementById("krw-toc");
    const initFunc = () => {
      // 有toc的页面
      // 获取侧边栏所有的toc项
      const tocDOMs = sidebarTocWidget.getElementsByClassName("toc-item");
      // 元素高度映射记录
      const tocItems = [];
      try {
        Array.from(tocDOMs).forEach((tocItem) => {
          const linkItem = tocItem.querySelector(".toc-link");
          const titleText = decodeURI(linkItem.getAttribute("href"));
          if (titleText.substring(0, 1) != "#") {
            throw new Error("TOC 小标题链接无效，格式无限");
          }
          const titleElem = document.getElementById(titleText.substring(1));
          if (!titleElem) {
            throw new Error("TOC 小标题链接无效，未找到相关引用");
          }
          titleElem.setAttribute("data-toc-id", tocItems.length);
          tocItems.push({
            at: titleElem,
            el: tocItem,
          });
        });
      } catch (e) {
        console.log("错误：", e.message);
        Array.from(tocDOMs).forEach((tocItem) => {
          tocItem.classList.add("show");
        });
        return;
      }

      // 初始化为不存在的标题
      let curTocId = -1;
      // 标题激活状态修改函数
      const tocActivate = (newId) => {
        if (curTocId === newId) {
          // Do nothing...
          return;
        }
        if (curTocId !== -1) {
          // 清除旧标题激活状态
          tocItems[curTocId].el.classList.remove("active");
          tocItems[curTocId].el.classList.remove("show");
          // 清除旧元素层级展示状态
          let nCur = tocItems[curTocId].el;
          while (!nCur.classList.contains("toc")) {
            if (nCur.classList.contains("toc-item")) {
              nCur.classList.remove("show");
            }
            nCur = nCur.parentNode;
          }
        }
        if (newId !== -1) {
          // 构建新标题激活状态
          tocItems[newId].el.classList.add("active");
          tocItems[newId].el.classList.add("show");
          // 建立新元素层级展示状态
          let nCur = tocItems[newId].el;
          while (!nCur.classList.contains("toc")) {
            if (nCur.classList.contains("toc-item")) {
              nCur.classList.add("show");
            }
            nCur = nCur.parentNode;
          }

          // 滚动出现（延迟到展开动画之后，避免 jitter ）
          setTimeout(() => {
            tocItems[newId].el.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
              inline: "nearest",
            });
          }, 300);
        }
        curTocId = newId;
      };

      if ("IntersectionObserver" in window) {
        const applyDecision = makeDelay((i, pos) => {
          if (pos === window.scrollY) {
            window.requestAnimationFrame(() => {
              tocActivate(i);
            });
          } else {
            applyDecision(i, window.scrollY);
          }
        }, 100);

        const observer = new IntersectionObserver(
          (entries) => {
            let decision = null;
            entries.forEach((entry) => {
              const currentIndex = Number.parseInt(
                entry.target.getAttribute("data-toc-id"),
                10,
              );
              if (
                !entry.isIntersecting &&
                entry.boundingClientRect.top <= entry.rootBounds.top
              ) {
                decision = currentIndex;
              } else if (
                entry.isIntersecting &&
                entry.boundingClientRect.bottom <
                  entry.rootBounds.top + entry.rootBounds.height / 2 &&
                entry.intersectionRatio === 1
              ) {
                decision = currentIndex - 1;
              }
            });
            if (decision !== null) {
              applyDecision(decision, window.scrollY);
            }
          },
          {
            rootMargin: "-62px 0px 0px 0px",
            threshold: 1.0,
          },
        );
        tocItems.forEach((x) => {
          observer.observe(x.at);
        });
        window.addEventListener(
          "pjax:before",
          () => {
            observer.disconnect();
            tocItems.length = 0; // 奇妙的数组清空方式
          },
          { once: true },
        );
      } else {
        const tocUpdatePos = () => {
          tocItems.forEach((x) => {
            x.h = x.at.getBoundingClientRect().top + window.scrollY - 61; // 比 click 事件那里多减掉1，避免浏览器 round 后导致的判断失败
          });
        };

        tocUpdatePos();

        // 标题定位函数
        const tocGetId = () => {
          let newPos;
          if (
            !Number.isInteger(curTocId) ||
            curTocId < 0 ||
            curTocId > tocItems.length - 1
          ) {
            newPos = 0;
          } else {
            newPos = curTocId;
          }
          const nowY = window.scrollY;
          if (nowY >= tocItems[newPos].h) {
            if (nowY >= tocItems[tocItems.length - 1].h) {
              newPos = tocItems.length - 1;
            } else {
              while (nowY >= tocItems[newPos + 1].h) {
                newPos++;
              }
            }
          } else {
            while (nowY < tocItems[newPos].h) {
              newPos--;
              if (newPos < 0) break;
            }
          }
          return newPos;
        };

        // 处理事件的函数
        const tocOnScroll = makeDelay(() => {
          window.requestAnimationFrame(() => {
            tocActivate(tocGetId());
          });
        }, 100);

        const tocOnResize = makeDelay(() => {
          tocUpdatePos();
          window.requestAnimationFrame(() => {
            tocActivate(tocGetId());
          });
        }, 100);

        window.addEventListener("resize", tocOnResize);
        window.addEventListener("scroll", tocOnScroll);
        // pjax前销毁
        window.addEventListener(
          "pjax:before",
          () => {
            window.removeEventListener("resize", tocOnResize);
            window.removeEventListener("scroll", tocOnScroll);
            tocItems.length = 0; // 奇妙的数组清空方式
          },
          { once: true },
        );
      }

      // 阅读进度
      const readProgBar =
        document.getElementsByClassName("toc-progress-bar")[0];
      const articleElem = document.querySelector(".kratos-page-content");
      const setPercent = () => {
        // 参考 Butterfly 主题相关实现
        // https://github.com/jerryc127/hexo-theme-butterfly/blob/c1ac4a5e167f7bb26287fc9ca32a182cfc293231/source/js/main.js#L337-L346
        if (articleElem) {
          const currentTop =
            window.scrollY || document.documentElement.scrollTop;
          const docHeight = articleElem.clientHeight;
          const winHeight = document.documentElement.clientHeight;
          const headerHeight = articleElem.offsetTop;
          const contentMath =
            docHeight > winHeight
              ? docHeight - winHeight
              : document.documentElement.scrollHeight - winHeight;
          const scrollPercent = Math.max(
            0,
            Math.min((currentTop - headerHeight) / contentMath, 1),
          );
          const scrollPercentRound = Math.round(scrollPercent * 100);
          readProgBar.style.width = (scrollPercent * 100).toString() + "%";
          readProgBar.setAttribute("aria-valuenow", scrollPercentRound);
        }
      };
      window.addEventListener("scroll", () => {
        window.requestAnimationFrame(setPercent);
      });
      setPercent(); // 初始运行一次
    };
    if (sidebarTocWidget) {
      if (sidebarTocWidget.offsetParent !== null) {
        initFunc();
      } else if ("IntersectionObserver" in window) {
        // Init when become visible
        new IntersectionObserver(initFunc, {
          threshold: 0,
          once: true,
        }).observe(sidebarTocWidget);
      }
    }
  };

  const initTopNavScrollToggle = (kr) => {
    // 判断设置参数
    if (!kr.enable) {
      return; // 没有启用
    }
    // 记录上一次滚动高度，用于判断滚动方向
    let lastHeight = window.innerHeight;
    // 记录顶部栏隐藏状态
    let isTopNavHidden = false;

    // 处理事件的函数
    const handleTopNavScrollToggle = () => {
      window.requestAnimationFrame(() => {
        if (lastHeight < window.scrollY) {
          // 向下滚动
          if (!isTopNavHidden) {
            document.body.classList.add("nav-up");
            isTopNavHidden = true;
          }
        } else if (lastHeight > window.scrollY) {
          // 向上滚动
          if (isTopNavHidden) {
            document.body.classList.remove("nav-up");
            isTopNavHidden = false;
          }
        }
        // 相等则不做处理
        lastHeight = window.scrollY;
      });
    };

    // 监听页面滚动事件
    window.addEventListener("wheel", handleTopNavScrollToggle);
  };

  const initPerPage = () => {
    tocWidgetAnimInit();
    saveTitle();
    codeCopyInit();
    collapseBoxControl();
    commentsLazyLoad();
  };

  const initPerPageWithConfig = (kr) => {
    initCopyrightNotice(kr.copyrightNoticeForCopy);
    checkExpireNotify(kr.expireNotify);
    viewerJsInit(kr.viewerjs);
  };

  const themeInit = () => {
    document.removeEventListener("DOMContentLoaded", themeInit, false);
    window.removeEventListener("load", themeInit, false);

    loadConfig().then((kr) => {
      initCopyEventListener(kr.copyrightNoticeForCopy);
      initInactiveNotice(kr.inactiveNotice);
      initUpTime(kr.uptime);
      initTopNavScrollToggle(kr.topNavScrollToggle);
      initPerPageWithConfig(kr);
      window.addEventListener("pjax:complete", () => {
        initPerPageWithConfig(kr);
      });
    });

    initPpageScrollDown();
    initOffcanvas();
    initPerPage();
    window.addEventListener("pjax:complete", () => {
      initPerPage();
    });
  };

  if (document.readyState === "complete") {
    setTimeout(themeInit);
  } else {
    document.addEventListener("DOMContentLoaded", themeInit, false);
    window.addEventListener("load", themeInit, false); //fallback
  }
})();
