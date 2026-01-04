import styles from "./style.module.scss";
import DecryptedText from "../common/DecryptedText";
import BlurText from "../common/BlurText";
const MainScreen = () => {
  return (
    <div className={styles.mainScreen}>
      <div
        className={styles.background}
        style={{
          backgroundImage: `url("${process.env.NEXT_PUBLIC_BASE_PATH}/image/index/programmer.jpg")`,
        }}
      ></div>
      <div className={styles.mask}></div>
      <div className={styles.container}>
        <div className={styles.content}>
          <div style={{ marginTop: "4rem" }}></div>
          <h1>
            <DecryptedText text="I" animateOn="view" revealDirection="center" />{" "}
            <span style={{ color: "var( --sub-color)" }}>
              <DecryptedText
                text="'"
                animateOn="view"
                revealDirection="center"
              />{" "}
            </span>
            <DecryptedText text="M" animateOn="view" revealDirection="center" />
          </h1>
          <h1>
            <DecryptedText
              text="ROY"
              animateOn="view"
              revealDirection="center"
            />{" "}
            <DecryptedText
              text="LIU,"
              animateOn="view"
              revealDirection="center"
            />
          </h1>
          <h1>
            <DecryptedText text="A" animateOn="view" revealDirection="center" />{" "}
            <span style={{ color: "var( --sub-color)" }}>
              <DecryptedText
                text="PROGRAMMER"
                animateOn="view"
                revealDirection="center"
              />
            </span>
          </h1>

          <h2>
            {" "}
            <BlurText
              text="BACKEND, FRONTEND, DEVOPS, a little bit of data science"
              delay={150}
              animateBy="words"
              direction="top"
              className="subtitle"
            />
          </h2>
        </div>
      </div>
    </div>
  );
};

export default MainScreen;
