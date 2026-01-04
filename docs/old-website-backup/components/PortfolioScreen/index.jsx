import { useEffect, useState } from "react";
import { Carousel } from "antd";

import Phone from "./components/Phone";
import Screen from "./components/Screen";
import styles from "./style.module.scss";
import Link from "next/link";

const ProtfolioScreen = () => {
  const [activeId, setActiveId] = useState();
  const [windowSize, setWindowSize] = useState("l");

  useEffect(() => {
    setWindowSize(window?.innerWidth < 480 ? "s" : "l");
  }, []);
  const profolios = [
    {
      id: 0,
      name: "reflex",
      img: `${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/sport.jpg`,
      titleRender: () => {
        return (
          <>
            <div className={styles.mainTitle}>運動數據</div>
            <div className={styles.subTitle}>Reflex</div>
          </>
        );
      },
      contentRender: () => {
        return (
          <>
            <div>
              <div className={styles.mainTitle}>運動數據</div>
              <div className={styles.subTitle}>
                Reflex 運動數據分析.分享平台{" "}
                <Link href="/portfolio?name=reflex">
                  <a href="" style={{ marginLeft: 10 }}>
                    More
                  </a>
                </Link>
              </div>
            </div>
            <div>
              <Carousel autoplay dots={false}>
                <div>
                  <Phone
                    style={{ margin: "0 auto" }}
                    width={150}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/reflex/reflex2.png`}
                  ></Phone>
                </div>
                <div>
                  <Screen
                    style={{ margin: "0 auto" }}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/reflex/reflexPC4.png`}
                    width={250}
                  ></Screen>
                </div>
              </Carousel>
            </div>
          </>
        );
      },
    },
    {
      id: 1,
      name: "chat",
      img: `${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/chat.jpg`,
      titleRender: () => {
        return (
          <>
            <div className={styles.mainTitle}>聊天室</div>
            <div className={styles.subTitle}>Chat room</div>
          </>
        );
      },
      contentRender: () => {
        return (
          <>
            <div>
              <div className={styles.mainTitle}>聊天室</div>
              <div className={styles.subTitle}>
                跨平台,低耦合性real time通信軟體{" "}
                <Link href="/portfolio?name=chatroom">
                  <a href="" style={{ marginLeft: 10 }}>
                    MORE
                  </a>
                </Link>
              </div>
            </div>
            <div>
              <Carousel autoplay dots={false}>
                <div>
                  <Phone
                    style={{ margin: "0 auto" }}
                    width={150}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/chatroom/chatroomNormal.gif`}
                  ></Phone>
                </div>
                <div>
                  <Screen
                    style={{ margin: "0 auto" }}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/chatroom/chatroom.png`}
                    width={250}
                  ></Screen>
                </div>
              </Carousel>
            </div>
          </>
        );
      },
    },
    {
      id: 3,
      name: "backstage",
      img: `${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/chart.jpg`,
      titleRender: () => {
        return (
          <>
            <div className={styles.mainTitle}>數據管理平台</div>
            <div className={styles.subTitle}>Backstage</div>
          </>
        );
      },
      contentRender: () => {
        return (
          <>
            <div>
              <div className={styles.mainTitle}>數據管理平台</div>
              <div className={styles.subTitle}>
                易操作、泛用的跨平台系統管理後台{" "}
                <Link href="/portfolio?name=backstage">
                  <a style={{ marginLeft: 10 }}>MORE</a>
                </Link>
              </div>
            </div>
            <div>
              <Carousel autoplay dots={false}>
                <div>
                  <Screen
                    style={{ margin: "0 auto" }}
                    width={250}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/backstage/backstage2.png`}
                  ></Screen>
                </div>
                <div>
                  <Screen
                    style={{ margin: "0 auto" }}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/backstage/backstage3.png`}
                    width={250}
                  ></Screen>
                </div>
              </Carousel>
            </div>
          </>
        );
      },
    },
    {
      id: 4,
      name: "hr",
      img: `${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/employee.jpg`,
      titleRender: () => {
        return (
          <>
            <div className={styles.mainTitle}>HR系統</div>
            <div className={styles.subTitle}>
              Human Resource Information System
            </div>
          </>
        );
      },
      contentRender: () => {
        return (
          <>
            <div>
              <div className={styles.mainTitle}>HR系統</div>
              <div className={styles.subTitle}>
                功能豐富的HR系統,包含差勤.薪資計算.總務系統。
                <Link href="/portfolio?name=hr">
                  <a href="" style={{ marginLeft: 10 }}>
                    MORE
                  </a>
                </Link>
              </div>
            </div>
            <div>
              <Carousel autoplay dots={false}>
                <div>
                  <Screen
                    style={{ margin: "0 auto" }}
                    width={250}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/eip/approval.png`}
                  ></Screen>
                </div>
                <div>
                  <Screen
                    style={{ margin: "0 auto" }}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/eip/leave1.png`}
                    width={250}
                  ></Screen>
                </div>
                <div>
                  <Screen
                    style={{ margin: "0 auto" }}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/eip/leave2.png`}
                    width={250}
                  ></Screen>
                </div>
              </Carousel>
            </div>
          </>
        );
      },
    },
    {
      id: 5,
      name: "crypto",
      img: `${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/crypto.jpg`,
      titleRender: () => {
        return (
          <>
            <div className={styles.mainTitle}>交易所</div>
            <div className={styles.subTitle}>Exchange</div>
          </>
        );
      },
      contentRender: () => {
        return (
          <>
            <div>
              <div className={styles.mainTitle}>交易所</div>
              <div className={styles.subTitle}>
                包含一般交易.合約交易的虛擬貨幣交易平台
                <Link href="/portfolio?name=crypto">
                  <a href="" style={{ marginLeft: 10 }}>
                    MORE
                  </a>
                </Link>
              </div>
            </div>
            <div>
              <Carousel autoplay dots={false}>
                <div>
                  <Screen
                    style={{ margin: "0 auto" }}
                    width={250}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/crypto/crypto-pc1.png`}
                  ></Screen>
                </div>{" "}
                <div>
                  <Screen
                    style={{ margin: "0 auto" }}
                    width={250}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/crypto/crypto-pc2.png`}
                  ></Screen>
                </div>
                <div>
                  <Phone
                    style={{ margin: "0 auto" }}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/crypto/crypto-mob4.png`}
                    width={150}
                  ></Phone>
                </div>
                <div>
                  <Phone
                    style={{ margin: "0 auto" }}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/crypto/crypto-mob5.png`}
                    width={150}
                  ></Phone>
                </div>
              </Carousel>
            </div>
          </>
        );
      },
    },
    {
      id: 6,
      name: "games",
      img: `${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/games.jpg`,
      titleRender: () => {
        return (
          <>
            <div className={styles.mainTitle}>遊戲平台</div>
            <div className={styles.subTitle}>Game Center</div>
          </>
        );
      },
      contentRender: () => {
        return (
          <>
            <div>
              <div className={styles.mainTitle}>遊戲平台</div>
              <div className={styles.subTitle}>
                各種各樣的遊戲綜合站台.
                <Link href="/portfolio?name=gameCenter">
                  <a href="" style={{ marginLeft: 10 }}>
                    MORE
                  </a>
                </Link>
              </div>
            </div>
            <div>
              <Carousel autoplay dots={false}>
                <div>
                  <Phone
                    style={{ margin: "0 auto" }}
                    width={150}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/meta/home1.png`}
                  ></Phone>
                </div>{" "}
                <div>
                  <Phone
                    style={{ margin: "0 auto" }}
                    width={150}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/blockLottery/home.png`}
                  ></Phone>
                </div>
                <div>
                  <Phone
                    style={{ margin: "0 auto" }}
                    width={150}
                    image={`${process.env.NEXT_PUBLIC_BASE_PATH}/image/portfolio/77lottery/home.png`}
                  ></Phone>
                </div>
              </Carousel>
            </div>
          </>
        );
      },
    },
  ];
  const profolioRender = (profolio) => {
    if (
      windowSize === "s" && activeId !== undefined && activeId !== profolio.id
        ? styles.active
        : ""
    ) {
      return <></>;
    }

    return (
      <div
        className={`${styles.profolio} ${
          activeId === profolio.id ? styles.active : ""
        } ${
          activeId != undefined && activeId != profolio.id
            ? styles.nonActive
            : ""
        }`}
        onClick={() => {
          if (activeId === profolio.id) {
            setActiveId(undefined);
          } else {
            setActiveId(profolio.id);
          }
        }}
        style={{ backgroundImage: `url("${profolio.img}")` }}
      >
        <div className={styles.mask}></div>
        <div className={styles.title}>{profolio.titleRender()}</div>
        <div className={styles.activeGroup}>{profolio.contentRender()}</div>
      </div>
    );
  };
  return (
    <div className={styles.protfolioScreen} style={{ position: "relative" }}>
      <div className={styles.content}>
        <div className={styles.title}>
          <p className={styles.main}>
            <span style={{ color: "var(--menu-text-active)" }}> 02</span>
            PORTFOLIO
          </p>
          <p className={styles.sub}>
            MY LATEST WORK.{" "}
            <a href={`${process.env.NEXT_PUBLIC_BASE_PATH}/portfolio`}>
              SEE MORE{" "}
            </a>
          </p>
        </div>
        <div
          className={`${styles.profolioContent}  ${
            windowSize === "s" && activeId !== undefined
              ? styles.haveActive
              : ""
          }`}
        >
          <div className={styles.profolios}>
            {profolios.map(profolioRender)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtfolioScreen;
