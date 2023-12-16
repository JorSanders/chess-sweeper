import { Board } from "./board/board";
import styles from "./page.module.css";

export default () => (
  <main className={styles.main}>
    <h1 className={styles.title}>Chess Sweeper</h1>
    <p className={styles.subtitle}>
      Can you reveal all tiles on the board without getting bricked?
    </p>
    <Board></Board>
  </main>
);
