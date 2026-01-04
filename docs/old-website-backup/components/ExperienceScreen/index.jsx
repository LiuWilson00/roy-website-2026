import styles from "./style.module.scss";
import { Timeline } from "antd";
import { useEffect, useRef, useState } from "react";
let varexp = [];
const ExperienceScreen = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  let contentHeights = [];

  const expRef = useRef();
  const [experience, setExperience] = useState([
    {
      dates: ["2012", "2016"],
      name: "PCCU",
      job: "Student",
      show: false,
      content:
        "就讀於文化大學數學系，由於家庭經濟狀況的因素，較晚入學，在校成績維持系上前三名，且積極參與多項統計、企劃比賽，且利用課餘時間自學app開發的技術，並且在求學期間參與多種不同的工作，養成跨領域的能力，雖然最後因家庭因素沒有畢業，但收穫了許多知識。",
    },
    {
      dates: ["2016", "2017"],
      name: "行銷公司",
      job: "企劃專員",
      show: false,
      content:
        "由於大學時期有參與過大量的行銷實務經驗，畢業後就經由介紹在行銷公司就業，在行銷業雖然學到許多職場工作的技巧、溝通的技巧、簡報的能力，但由於在工作上得不到成就感、個人興趣等因素，最後還是毅然決然選擇辭職轉投入軟體業。",
    },
    {
      dates: ["2017", "2018"],
      name: "桓基科技",
      job: "on site engineer",
      show: false,
      content:
        "一開始轉職軟體業進入的公司，讓我累積大量的實務經驗，由於剛轉職且並非CS本科系，所以沒有太多優秀的作品，所以起初的職務是簡單的現場維護工程師，主要是維護公家機關的HR系統，但在桓基就業的過程處理許多實務上的問題中，漸漸累積了開發的能力跟作品。",
    },
    {
      dates: ["2018", "2019"],
      name: "YPCloud",
      job: "Frontend developer",
      show: false,
      content:
        "第一次參與前後端分離的公司，雖然過去工作是採用ASP.net，但在工作之餘有累積了許多前端框架的開發經驗，所以順利應徵到前端工程師的職務，公司主要業務是做SAAS的服務，由於公司的業務發展還在摸索階段，所以做了很多很新的技術，也得到了許多收穫。",
    },
    {
      dates: ["2020", "2022"],
      name: "POYUE",
      job: "Frontend manager",
      show: false,
      content:
        "是公司前幾個應徵進來的RD，在工作過程漸漸受到技術部主管的賞賜，被賦予了前端團隊主管的職務，在工作過程中自己的能力也逐漸成長，由於是公司的前端主管所以除了要完成功能外，也要建立起團隊的開發架構、規範等，同時也得到很豐富的帶人經驗，和團隊成員、跨部門的同事相處十分融洽，由於公司是接案公司，案子五花八門所以也完成了許多不同領域的專案。",
    },
    {
      dates: ["2022", "2023"],
      name: "Authme",
      job: "Frontend developer",
      show: false,
      content:
        "公司主要是研發KYC及相關應用，在公司內的主要業務是進行SDK的維護與開發，在剛進入公司就立即進入狀況解決web當下維運相關的問題，並且在sdk中引入框架、接手wasm的維護，以及實作KYC引擎的測試架構等，並且持續在多變創新的環境適應與成長。",
    },
    {
      dates: ["2023", "2024"],
      name: "ICYBox",
      job: "Full stack developer",
      show: false,
      content:
        "公司主要是研發KYC及相關應用，在公司內的主要業務是進行SDK的維護與開發，在剛進入公司就立即進入狀況解決web當下維運相關的問題，並且在sdk中引入框架、接手wasm的維護，以及實作KYC引擎的測試架構等，並且持續在多變創新的環境適應與成長。",
    },
    {
      dates: ["2025", "now"],
      name: "YTCloud",
      job: "Senior Frontend developer",
      show: false,
      content:
        "公司主要是研發KYC及相關應用，在公司內的主要業務是進行SDK的維護與開發，在剛進入公司就立即進入狀況解決web當下維運相關的問題，並且在sdk中引入框架、接手wasm的維護，以及實作KYC引擎的測試架構等，並且持續在多變創新的環境適應與成長。",
    },
  ]);
  const scrollHandler = (el) => {
    const scrollTop = el.target.documentElement.scrollTop;
    // const targetHeight = expRef.current.offsetTop;
    const windowHeight = document.documentElement.offsetHeight;
    const showPoint = windowHeight * 2.3;
    if (scrollTop > showPoint) {
      setIsScrolled(true);
    }
    let h = 0;
    contentHeights.forEach((height, index) => {
      if (scrollTop > showPoint + h) {
        if (!varexp[index].show) {
          let newExp = JSON.parse(JSON.stringify(varexp));
          newExp[index].show = true;
          setExperience(newExp);
        }
      }
      h += height;
    });
  };

  useEffect(() => {
    varexp = experience;
  }, [experience]);
  useEffect(() => {
    const targets = document.querySelectorAll(".ant-timeline-item-tail");
    //[1].offsetHeight
    const contentContents = document.querySelectorAll(
      ".ant-timeline-item-content"
    );
    contentContents.forEach((c) => {
      contentHeights.push(c.offsetHeight * 1.2);
    });
    targets.forEach((line, index) => {
      line.style = `transition-delay: ${index * 0.3}s;`;
    });
    window.addEventListener("scroll", scrollHandler);
    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);
  const timelineItemRender = (exp, index) => {
    return (
      <Timeline.Item color="var(--sub-color)" key={index}>
        <div
          className={styles.timelineItem}
          style={{
            transition: "opacity 1.5s",
            transitionTimingFunction: "ease-in-out",
            opacity: exp.show ? 1 : 0,
          }}
        >
          <p className={styles.timelineDates}>
            {exp.dates[0]}-{exp.dates[1]}
          </p>
          <p className={styles.timelineName}> {exp.name}</p>
          <p className={styles.timelineJob}>{exp.job}</p>
          <p className={styles.timelineContent}>{exp.content}</p>
        </div>
      </Timeline.Item>
    );
  };
  return (
    <div
      className={styles.experienceScreen}
      ref={expRef}
      id="experience"
      style={{ position: "relative" }}
    >
      <div className={styles.content}>
        <div className={styles.title}>
          <p className={styles.main}>
            <span style={{ color: "var(--menu-text-active)" }}> 03</span>
            EXPERIENCE
          </p>
        </div>
        <div>
          <Timeline mode="alternate" className={isScrolled ? "" : "hide"}>
            {experience.map(timelineItemRender)}
          </Timeline>
        </div>
      </div>
    </div>
  );
};

export default ExperienceScreen;
