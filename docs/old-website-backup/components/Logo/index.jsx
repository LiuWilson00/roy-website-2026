import styles from "./style.module.scss";

const Logo = (params) => {
  const { size, onClick } = params;
  return (
    <div className={styles.logoArea} onClick={onClick}>
      <div
        className={styles.logo}
        style={{
          fontSize: `${size}rem`,
          padding: `${size * 0.5}rem  ${size * 0.25}rem`,
        }}
      >
        Roy Studio
      </div>
    </div>
  );
};

export default Logo;
