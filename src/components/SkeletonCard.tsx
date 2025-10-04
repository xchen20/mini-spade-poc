import React from 'react';
import styles from '@/styles/Home.module.css';

const SkeletonCard = () => {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonTitle} />
      <div className={styles.skeletonText} />
      <div className={styles.skeletonText} style={{ width: '90%' }} />
      <div className={styles.skeletonText} style={{ width: '70%' }} />
    </div>
  );
};

export default SkeletonCard;