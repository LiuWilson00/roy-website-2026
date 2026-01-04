import styles from "./style.module.scss";

const ConactCard = ({ style }) => {
  return (
    <div id="contact" style={style} className={styles.introduceCard}>
      <div className={styles.content}>
        <h1>Conact Me</h1>
        <div className={styles.text}>
          <p>liuwei811007@gmail.com</p>
          <p>LINE@assss49</p>
          <p>
            <a href="https://www.linkedin.com/in/wei-liu-86666b1b3/">LinkedIn</a>{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConactCard;
