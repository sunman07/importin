import React, { useState, Fragment } from 'react';
import { Layout, Card } from 'antd';
const { Header, Content } = Layout;
import StandardConfigSecondary from './integraldata/index';
import styles from './index.less';
export default () => {
  return (
    <Card title="批量录入" className={styles.headersheild}>
      <StandardConfigSecondary />
    </Card>
  );
};
