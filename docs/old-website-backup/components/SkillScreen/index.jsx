import { useEffect, useRef, useState } from "react";

import IntroduceCard from "../IntroduceCard";
import styles from "./style.module.scss";

const SkillScreen = () => {
  const [isScolled, setIsScolled] = useState(false);
  const [windowSize, setWindowSize] = useState("l");
  // const [currentSkill, setCurrentSkill] = useState();

  useEffect(() => {
    setWindowSize(window?.innerWidth < 480 ? "s" : "l");
  }, []);
  const skillRef = useRef();
  const skillList = [
    {
      name: "FRONT END",
      id: 0,
      value: 95,
      detail: [
        { name: "react" },
        { name: "Vue" },
        { name: "html/css/javasript" },
        { name: "JQuery" },
      ],
    },
    {
      name: "BACK END",
      id: 1,
      value: 80,
      detail: [
        { name: "asp.net" },
        { name: "express" },
        { name: "django" },
        { name: "laravel" },
        { name: "mysql" },
        { name: "mssql" },
        { name: "mangodb" },
      ],
    },
    {
      name: "MOBILE",
      id: 7,
      value: 75,
      detail: [{ name: "react native" }, { name: "swift" }, { name: "Kotlin" }],
    },
    {
      name: "DEVOPS",
      id: 2,
      value: 70,
      detail: [
        { name: "centos" },
        { name: "red hat enterprise" },
        { name: "AWS" },
        { name: "GCP" },
      ],
    },
    {
      name: "UI/UX",
      id: 3,
      value: 65,
      detail: [
        { name: "adobe XD" },
        { name: "adobe AI" },
        { name: "adobe PS" },
        { name: "procreate" },
      ],
    },
    {
      name: "DATA ANALYSE",
      id: 4,
      value: 75,
      detail: [
        { name: "Calculus" },
        { name: "Linear algebra" },
        { name: "Statistics" },
      ],
    },
    {
      name: "Machine learning",
      id: 5,
      value: 70,
      detail: [
        { name: "deep learning" },
        { name: "Reinforcement learning" },
        { name: "belief network" },
        { name: "Decision tree" },
      ],
    },
    { name: "Project management", id: 6, value: 85, detail: [] },
  ];

  const skillRender = (skill, index) => {
    return (
      <div key={skill.id} className={styles.skill}>
        <div className={styles.skillMain}>
          <div className={styles.skillName}>{skill.name.toUpperCase()}</div>
          <div className={styles.skillChar}>
            <div
              className={styles.chatView}
              style={{
                backgroundColor: "var(--sub-color)",
                transitionProperty: "width, color",
                transitionDuration: "1s",
                transitionDelay: `${(index * 100) / 1000}s`,
                transitionTimingFunction: "ease-in",
                height: 12,
                width: `${isScolled ? skill.value : 0}%`,
                cursor: "pointer",
              }}
            ></div>
            <span
              style={{
                transition: "opacity 1s",
                opacity: isScolled ? 1 : 0,
              }}
            >{`${skill.value}%`}</span>
          </div>
        </div>
        <div className={styles.skillDetail}>
          {skill.detail.map((s) => (
            <span
              style={{
                borderRadius: 20,
                padding: windowSize === "s" ? "2.5px 5px" : "5px 10px",
                marginLeft: 5,
                backgroundColor: "var(--sub-background)",
                color: "white",
                fontSize: windowSize === "s" ? 10 : 12,
              }}
              key={s.name}
            >
              {s.name.toUpperCase()}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const scrollHandler = (el) => {
    const scrollTop = el.target.documentElement.scrollTop;
    const targetHeight = skillRef.current.offsetTop;
    if (scrollTop > targetHeight) {
      setIsScolled(true);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", scrollHandler);
    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  }, []);

  return (
    <div id="professional" className={styles.skillScreen} ref={skillRef}>
      <IntroduceCard></IntroduceCard>
      <div
        className={styles.background}
        style={{
          backgroundImage: `url("${process.env.NEXT_PUBLIC_BASE_PATH}/image/index/prossional.jpg")`,
        }}
      ></div>
      <div className={styles.mask}></div>
      <div className={styles.content}>
        <div className={styles.title}>
          <p className={styles.main}>
            <span style={{ color: "var(--menu-text-active)" }}> 01</span>
            PROFESSIONAL
          </p>
          <p className={styles.sub}>MY KNOWLEDGE LEVEL IN SOFTWARE</p>
        </div>
        <div className={styles.skills}>{skillList.map(skillRender)}</div>
      </div>
    </div>
  );
};
export default SkillScreen;
