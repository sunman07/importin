import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Button, Select, Layout, Form, Input, Modal, message } from 'antd';
import {
  getScoreOfEntry,
  getApproveScore,
  getSystemOfParameter,
  getTermAllClass,
} from '@/services/service';
import moment from 'moment';
import styles from './integraldata.less';
import classNames from 'classnames';
import SearchSubUnit from './searchform';
import MainContent from './maincontent';
import DetailsSubUnit from './detailsdisplay';

const { Option } = Select;
const { Content } = Layout;
//初始化参数
const paramsReset = {
  Page: 1,
  PageCount: 10,
  AcademicYearCode: '',
  AcademicTermCode: '',
  AcademyCode: '',
  GradeCode: '',
  ClassCode: '',
  ModuleCode: '',
  ItemCode: '',
  StandardCode: '',
  StuUserCode: '',
  StuName: '',
  StartDate: '',
  EndDate: '',
};
const StandardConfigSecondary = () => {
  const [configEntry, setConfigEntry] = useState([]);
  const [paramsOfEntry, setParamsOfEntry] = useState(paramsReset);
  // 表格条目总数
  const [mainTotal, setMainTotal] = useState(Number);
  const [mainloading, setMainloading] = useState(false);
  //查看详情
  const [checkDetails, setCheckDetails] = useState(false);
  //传递详情数据至detailsdisplay组件
  const [infoDetails, setInfoDetails] = useState(Object);
  //系统参数
  const [argumentSystem, setArgumentSystem] = useState(String);
  //搜索范围 传递给子组件
  const [scopeOfSystem, setScopeOfSystem] = useState([]);
  const [form] = Form.useForm();
  const openDetails = values => {
    setInfoDetails(values);
    setCheckDetails(true);
  };
  const closeDetails = () => {
    setCheckDetails(false);
    setInfoDetails('');
  };

  //获取系统参数 确定当前角色获取学年/学期范围
  const getSystemConfig = () => {
    getSystemOfParameter().then(res => {
      if (res.status === 200) {
        let paramSystemAll = [];
        switch (res.data.Value) {
          case '1':
            paramSystemAll = ['AcademicTerm', 'AcademicYear'];
            break;
          case '3':
            paramSystemAll = ['AcademicYear', ''];
            break;
          default:
            paramSystemAll = ['', ''];
            break;
        }
        getTermSumAllClass(paramSystemAll);
      } else {
        message.error('获取系统参数失败,无法获取范围字典');
      }
    });
  };

  const getTermSumAllClass = params => {
    getTermAllClass(params).then(res => {
      if (res.status === 200) {
        setScopeOfSystem(res.data.list);
      } else {
        message.error('获取范围字典失败');
      }
    });
  };

  //搜索表单提交
  const onFinish = values => {
    //处理表单日期
    const dateParams = {
      StartDate: values.DateTime
        ? moment(values.DateTime[0]._d).format('YYYY-MM-DD')
        : '',
      EndDate: values.DateTime
        ? moment(values.DateTime[1]._d).format('YYYY-MM-DD')
        : '',
    };
    //如果有undefined(未填写)把它们处理成空字符串
    for (let i in values) {
      values[i] = values[i] ? values[i] : '';
    }
    const searchValues = Object.assign(values, dateParams, {
      Page: 1,
      PageCount: 10,
    });
    //console.log(searchValues,'搜索结果',values);
    setParamsOfEntry(searchValues);
  };

  // 表单重置
  const onReset = () => {
    pageForContent.current.subPageChange(1);
    setParamsOfEntry(paramsReset);
  };

  //获取子组件方法 列表分页
  const pageForContent = useRef(null);

  //分页
  const onPageChange = values => {
    let copyOfEntry = {
      ...paramsOfEntry,
    };
    copyOfEntry.Page = values;
    setParamsOfEntry(copyOfEntry);
  };

  //获取主列表 传入子组件
  const getConfigForStandard = () => {
    setMainloading(true);
    //清空主列表
    setConfigEntry([]);
    getScoreOfEntry(paramsOfEntry).then(res => {
      if (res.status == 200) {
        setMainloading(false);
        setMainTotal(res.data.Total);
        res.data.List &&
          res.data.List.forEach(item => {
            item.StartDate = moment(item.StartDate).format(
              'YYYY-MM-DD HH:mm:ss',
            );
          });
        setConfigEntry(res.data.List);
      }
    });
  };
  useEffect(() => {
    getConfigForStandard();
  }, [paramsOfEntry]);

  useEffect(() => {
    getSystemConfig();
  }, []);

  return (
    <>
      <Fragment>
        <Layout className={classNames(styles.frontpage, styles.drawerWrapper)}>
          {/*  <Header>
            {' '}
            <HeaderGroup />
          </Header> */}
          <SearchSubUnit
            onSearch={onFinish}
            onReset={onReset}
            scopeOfSystem={scopeOfSystem}
          />
          <Content className={classNames(styles.contentMain)}>
            <MainContent
              className={styles.tablePeri}
              mainloading={mainloading}
              openDetails={openDetails}
              onReset={onReset}
              ref={pageForContent}
              mainData={configEntry}
              searchValues={paramsOfEntry}
              pageTotal={mainTotal}
              pageChange={onPageChange}
            />
          </Content>
          <Modal
            title="查看详情"
            visible={checkDetails}
            onCancel={closeDetails}
            destroyOnClose={true}
            footer={
              <div>
                <Button
                  className={styles.buttonApprove}
                  onClick={() => {
                    closeDetails();
                  }}
                  htmlType="button"
                >
                  确认
                </Button>
              </div>
            }
          >
            <DetailsSubUnit infoDetails={infoDetails} />
          </Modal>
        </Layout>
      </Fragment>
    </>
  );
};

export default StandardConfigSecondary;
