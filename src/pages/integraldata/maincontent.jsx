import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  Fragment,
  useRef,
} from 'react';
import { Table, Divider, Row, Col, Button, message, Modal } from 'antd';
import FormEntering from './forminput';
import styles from './integraldata.less';
import { delConfigEntry } from '@/services/service';
const MainContent = forwardRef((props, ref) => {
  const {
    mainData,
    pageTotal,
    pageChange,
    mainloading,
    onReset,
    openDetails,
    searchValues,
  } = props;
  const [pageNum, setPageNum] = useState(1);
  const [selectedRowKey, setSelectedRowKey] = useState(String);
  const [stepOfInput, setStepOfInput] = useState(false);

  useImperativeHandle(ref, () => ({
    subPageChange: subPageChange,
  }));
  const subPageChange = value => {
    setPageNum(value);
    pageChange(value);
  };

  //选择行
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKey(selectedRowKeys);
    },
  };

  const columns = [
    {
      title: '姓名',
      dataIndex: 'StuName',
      key: 'StuName',
    },
    {
      title: '学号',
      dataIndex: 'StuUserCode',
      key: 'StuUserCode',
    },
    {
      title: '班级',
      dataIndex: 'ClassName',
      key: 'ClassName',
    },

    {
      title: '年级',
      dataIndex: 'GradeName',
      key: 'GradeName',
    },
    {
      title: '院系',
      dataIndex: 'AcademyName',
      key: 'AcademyName',
    },

    {
      title: '模块',
      dataIndex: 'ModuleName',
      key: 'ModuleName',
    },
    {
      title: '项目',
      dataIndex: 'ItemName',
      key: 'ItemName',
    },
    {
      title: '标准',
      dataIndex: 'StandardName',
      key: 'StandardName',
    },

    {
      title: '获得积分',
      dataIndex: 'CurScore',
      key: 'CurScore',
    },
    {
      title: '时长',
      dataIndex: 'TimeLen',
      key: 'TimeLen',
    },
    {
      title: '参与时间',
      dataIndex: 'ParticipateDate',
      key: 'ParticipateDate',
    },
    {
      title: '详细',
      dataIndex: 'address',
      render: (text, record) => {
        return (
          <a
            onClick={() => {
              openDetails(record);
            }}
          >
            点击查看
          </a>
        );
      },
    },
    {
      title: '附件',
      dataIndex: 'address',
      render: (text, record) => {
        return <a>点击查看</a>;
      },
    },
  ];

  //
  const delEntryItem = () => {
    const params = {
      RecordId: selectedRowKey,
    };
    delConfigEntry(params).then(res => {
      if (res.status === 200 && res.data.Msg === '操作成功') {
        message.success(res.data.Msg);
        onReset();
      }
    });
  };

  const importEntryItem = () => {
    setStepOfInput(true);
  };

  const formRef = useRef(null);

  const submitItem = values => {
    console.log(formRef.current);
    formRef.current.submitItem();
    // formRef.current.submitItem();
    // setStepOfInput(false)
  };
  const cancelItem = () => {
    setStepOfInput(false);
  };
  return (
    <Fragment>
      <Row className={styles.mainApprove}>
        <Col span="24" align="right">
          <Button onClick={delEntryItem} className={styles.itemDel}>
            批量删除
          </Button>
          <Button onClick={importEntryItem} type="primary">
            批量导入
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={mainData}
        rowKey="RecordId"
        rowSelection={rowSelection}
        loading={mainloading}
        pagination={{
          total: pageTotal,
          pageSize: 10,
          current: pageNum,
          onChange: page => subPageChange(page),
        }}
        className={styles.tablePeri}
        bordered={true}
        hideOnSinglePage={false}
      />
      <Modal
        title="批量导入"
        visible={stepOfInput}
        onOk={submitItem}
        onCancel={() => {
          cancelItem();
        }}
        destroyOnClose
      >
        <FormEntering ref={formRef} onSubmit={submitItem} />
      </Modal>
    </Fragment>
  );
});
export default MainContent;
