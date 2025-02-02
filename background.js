function prevTab() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (activeTabs) => {
      let currentIndex = tabs.findIndex((tab) => tab.id === activeTabs[0].id);
      let prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      chrome.tabs.update(tabs[prevIndex].id, { active: true });
    });
  });
}

function clickRun() {
  console.log("Lập lại");
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting
      .executeScript({
        target: { tabId: tabs[0].id },
        func: function () {
          (function () {
            const GET_JOB = ".btn.btn-outline-light";
            const WORD_JOB = ".btn.bg-button-1.px-0.btn-block";
            const CLAM_JOB = ".btn.btn-block.b-0.bg-button-1.px-0";
            const SUBMIT_JOB = ".swal2-confirm.swal2-styled";

            const DELAY = 2000;
            const DELAY_TAB = 10000;
            const DELAY_CHECK_ELEMENT = 30000;
            const DELAY_FOLLOW_SHOPEE = 10000;

            async function getJob() {
              const buttonGetJob = document.querySelector(GET_JOB);

              if (buttonGetJob) {
                buttonGetJob.click();
                console.log("[Nhận JOB]");

                await waitForElement(WORD_JOB);

                await work();
              } else {
                console.error("Không nhận được job");
              }
            }

            async function work() {
              const buttonWork = document.querySelector(WORD_JOB);

              if (buttonWork) {
                buttonWork.click();
                console.log("[WORD]");

                await new Promise((resolve) =>
                  setTimeout(resolve, DELAY_FOLLOW_SHOPEE)
                );
                await chrome.runtime.sendMessage({ action: "followShopee" });

                await new Promise((resolve) => {
                  setTimeout(() => {
                    chrome.runtime.sendMessage({ action: "prevTab" });
                    resolve();
                  }, DELAY_TAB);
                });

                await new Promise((resolve) => setTimeout(resolve, DELAY));

                await clam();
              } else {
                console.error("[Đợi job]");
                setTimeout(() => work(), DELAY);
              }
            }

            async function clam() {
              const buttons = document.querySelectorAll(CLAM_JOB);

              const findButtonByText = (text) => {
                return Array.from(buttons).find(
                  (button) => button.textContent.trim() === text
                );
              };

              const buttonClam = findButtonByText("Hoàn thành");

              if (buttonClam) {
                buttonClam.click();
                console.log("[Clam JOB]");

                await waitForElement(SUBMIT_JOB);

                await submit();
              } else {
                console.error("[Đợi clam]");
                setTimeout(() => clam(), DELAY);
              }
            }

            async function submit() {
              const buttonSubmit = document.querySelector(SUBMIT_JOB);
              if (buttonSubmit) {
                buttonSubmit.click();
                console.log("[Submit JOB]");

                await waitForElement(GET_JOB);

                setTimeout(() => {
                  chrome.runtime.sendMessage({ action: "clickRun" });
                }, DELAY);
              } else {
                console.error("[Đợi Submit]");
                setTimeout(() => submit(), DELAY);
              }
            }

            async function waitForElement(
              selector,
              timeout = DELAY_CHECK_ELEMENT
            ) {
              const startTime = Date.now();

              return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                  const element = document.querySelector(selector);

                  if (element) {
                    clearInterval(interval);
                    resolve();
                  } else if (Date.now() - startTime > timeout) {
                    clearInterval(interval);
                    reject(
                      new Error(
                        "Timeout: Element không xuất hiện trong thời gian quy định"
                      )
                    );
                  }
                }, 500);
              });
            }

            getJob();
          })();
        },
      })
      .catch((err) => console.error("Error executing script:", err));
  });
}

function clickFollowShopee() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error("No active tabs found.");
      return;
    }

    const tabId = tabs[0].id;
    console.log("Active Tab ID:", tabId);

    chrome.scripting
      .executeScript({
        target: { tabId: tabId },
        func: function () {
          const FOLLOW_SHOPEE =
            ".section-seller-overview-horizontal__button button";

          const DELAY = 2000;
          const DELAY_CHECK_ELEMENT = 30000;

          async function followShopee() {
            const buttonFollowShopee = document.querySelector(FOLLOW_SHOPEE);

            if (buttonFollowShopee) {
              buttonFollowShopee.click();
              console.log("[Follow shoppee]");
            } else {
              console.error("[Đợi follow shoppee]");
              setTimeout(followShopee, DELAY);
            }
          }

          async function waitForElement(
            selector,
            timeout = DELAY_CHECK_ELEMENT
          ) {
            const startTime = Date.now();

            return new Promise((resolve, reject) => {
              const interval = setInterval(() => {
                const element = document.querySelector(selector);

                if (element) {
                  clearInterval(interval);
                  resolve();
                } else if (Date.now() - startTime > timeout) {
                  clearInterval(interval);
                  reject(
                    new Error(
                      "Timeout: Element không xuất hiện trong thời gian quy định"
                    )
                  );
                }
              }, 500);
            });
          }

          async function runFollowShopee() {
            await waitForElement(FOLLOW_SHOPEE);
            await followShopee();
          }

          runFollowShopee();
        },
      })
      .catch((err) => console.error("Error executing script:", err));
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "prevTab") {
    prevTab();
  } else if (request.action === "clickRun") {
    clickRun();
  } else if (request.action === "followShopee") {
    clickFollowShopee();
  }
});
