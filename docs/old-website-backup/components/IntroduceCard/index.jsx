import styles from "./style.module.scss";
import Logo from "../Logo";
import { useEffect, useState } from "react";
const IntroduceCard = () => {
  const [logoSize, setLogoSize] = useState(1);
  useEffect(() => {
    setLogoSize(window?.innerWidth < 480 ? 1 : 3);
  }, []);

  return (
    <div className={styles.introduceCard}>
      <div className={styles.logoGroup}>
        <Logo size={logoSize}></Logo>
      </div>
      <div className={styles.content}>
        <div className={styles.text}>
          我是一名軟體工程師，熟悉前端、後端開發，也有資料分析、機器學習、devOps的實務經驗，
          大學主修應用數學系，對任何最新的技術都充滿好奇心，由於興趣十分廣泛，
          除了軟體開發及統計以外我也有設計、美術、文字企劃的能力，
          同時我的自學能力也十分卓越，可以依照老闆的要求學習新的技術並應用在專案中，
          最後我也是一名擅長溝通的協調者、管理者，擅長在工作中建立良好的協作關係、團隊氛圍，
          由於生長過程的關係，我的抗壓性及適應性十分過人，可以在不同的工作環境中發揮，
          我相信我會是貴公司團隊的關鍵拼圖。
        </div>
      </div>
    </div>
  );
};

export default IntroduceCard;
