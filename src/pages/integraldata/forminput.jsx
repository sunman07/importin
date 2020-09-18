import React, {
  useState,
  useEffect,
  useRef,
  Fragment,
  useImperativeHandle,
  forwardRef,
} from 'react';
import {
  Button,
  Select,
  Layout,
  Form,
  Input,
  Modal,
  DatePicker,
  message,
  Upload,
} from 'antd';
import {
  getGrade,
  getModuleDic,
  getObjectDic,
  getStandardsDic,
  getMangerClass,
  getGradeWithTerm,
  getMangerAcademy,
  importTokenGet,
  dealWithToken,
  downloadExcelData,
  getTermAndYear,
  submitAllSum,
} from '@/services/service';
import styles from './integraldata.less';
import * as qiniu from 'qiniu-js';
import {
  UploadOutlined,
  LoadingOutlined,
  PlusOutlined,
} from '@ant-design/icons';
const FormEntering = forwardRef((props, ref) => {
  const { onSubmit } = props;
  const [moduleEntry, setModuleEntry] = useState([]); // 模块select
  const [objectEntry, setObjectEntry] = useState([]); // 项目select
  const [standardEntry, setStandardEntry] = useState([]); // 项目select
  const [classEntry, setClassEntry] = useState([]); // 班级select
  const [termEntry, setTermEntry] = useState([]); // 学期select
  const [gradeEntry, setGradeEntry] = useState([]); // 学期select
  const [gradeTermEntry, setGradeTermEntry] = useState([]); // 学年学期select
  const [academyEntry, setAcademyEntry] = useState([]); //学院字典
  const [fileList, setFileList] = useState([]); //excel上传
  const [fileIMGList, setFileIMGList] = useState([]); //IMG上传
  const [previewImage, setPreviewImage] = useState(String);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewTitle, setPreviewTitle] = useState(String);
  const [imgID, setImgID] = useState(String);
  const [dateString, setDateString] = useState(String);
  //AcademicTerm
  const [academicTerm, setAcademicTerm] = useState([]);
  const [academicYear, setAcademicYear] = useState([]);
  const [termVisible, setTermVisible] = useState(String);
  const [formDataGet, setFormDataGet] = useState(Object);
  const [form] = Form.useForm();
  const { RangePicker } = DatePicker;
  const { TextArea } = Input;
  //重置表单
  const formReset = event => {
    form.resetFields();
    onReset();
  };
  useImperativeHandle(ref, () => ({
    submitItem: submitItem,
  }));

  //获取字典项
  const getSelectSum = () => {
    //获取学年学期
    getTermAndYear().then(res => {
      if (res.status === 200) {
        setTermVisible(res.data.status);
        setAcademicTerm(res.data.AcademicTerm);
        setAcademicYear(res.data.AcademicYear);
      } else {
        message.error('获取学年学期字典失败!');
      }
    });
    //模块字典
    getModuleDic().then(res => {
      if (res.status === 200) {
        setModuleEntry(res.data.list);
      } else {
        message.error('获取模块字典失败');
      }
    });
    //获取班级
    getMangerClass().then(res => {
      if (res.status === 200) {
        setClassEntry(res.data.Classes);
      } else {
        message.error('获取班级字典失败');
      }
    });

    //获取学年
    getGradeWithTerm({ code_type: 'AcademicYear' }).then(res => {
      if (res.status === 200) {
        setTermEntry(res.data.list);
      } else {
        message.error('获取学年字典失败');
      }
    }),
      //获取学期
      getGradeWithTerm({ code_type: 'AcademicTerm' }).then(res => {
        if (res.status === 200) {
          setGradeEntry(res.data.list);
        } else {
          message.error('获取学期字典失败');
        }
      }),
      //获取院系
      getMangerAcademy().then(res => {
        if (res.status === 200) {
          setAcademyEntry(res.data.list);
        } else {
          message.error('获取院系字典失败');
        }
      });
  };

  const getItemSum = params => {
    //项目字典
    getObjectDic(params).then(res => {
      if (res.status === 200) {
        setObjectEntry(res.data.List);
      } else {
        message.error('获取项目字典失败');
      }
    });
  };

  const getStandardSum = params => {
    //标准字典
    getStandardsDic(params).then(res => {
      if (res.status === 200) {
        setStandardEntry(res.data.List);
      } else {
        message.error('获取标准字典失败');
      }
    });
  };

  useEffect(() => {
    getSelectSum(); // 获取综合字典项
  }, []);

  // 切换模块时
  const moduleChange = moduleCode => {
    getItemSum(moduleCode);
    form.setFieldsValue({ ItemCode: '' });
    form.setFieldsValue({ StandardCode: '' });
  };

  const itemChange = itemCode => {
    getStandardSum(itemCode);
    form.setFieldsValue({ StandardCode: '' });
  };

  const rangeConfig = {
    rules: [
      { required: false, message: '请选择时间!' },
      () => ({
        validator(rule, value) {
          if (dateString === '') {
            return Promise.reject('请选择时间!');
          } else {
            return Promise.resolve();
          }
        },
      }),
    ],
  };

  const uploadExcelProps = {
    name: 'file_data',
    //action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
    //listType: 'picture',
    // action: '/api/classmanage/importclass',
    method: 'POST',
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info) {
      setFileList(info.fileList);

      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        console.log(info.file, '成功', '上传完毕！！！');

        console.log(info.file, info.fileList);
      }
    },
    //进度条样式
    progress: {
      strokeColor: {
        '0%': '#1890ff',
        '100%': '#1890ff',
      },
      strokeWidth: 12,
    },
  };

  const getBase64 = file => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };
  const handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview),
      setPreviewVisible(true),
      setPreviewTitle(
        file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
      );
  };

  const handleIMGChange = file => {
    setFileIMGList(file.fileList);
    if (file.fileList.length === 0) {
      setImgID('');
    }
  };
  const handleIMGCancel = () => {
    setPreviewVisible(false);
  };
  //导入图片
  const beforeIMGUpload = (file, fileList) => {
    const formData = new FormData();
    console.log(formData, '0');
    formData.append('File', file);
    //importTokenGet
    console.log(file, 'rookie', file.name, file.size);
    importTokenGet(file.name, file.size).then(res => {
      console.log(res.data.Data, '返回token');
      uploadSevenBull({
        file: file,
        key: res.data.Data.Key,
        token: res.data.Data.Proof,
      });
    });
  };

  //上传七牛云并再次请求获取RecordID
  const uploadSevenBull = obj => {
    console.log('qiniu', obj);
    const that = this;
    const observable = qiniu.upload(obj.file, obj.key, obj.token);
    observable.subscribe({
      next: res => {
        // 主要用来展示进度
      },
      error: err => {
        // 失败报错信息
        console.log(err);
        message.error('上传失败');
      },
      complete: response => {
        // 接收成功后返回的信息
        dealWithToken(obj.file, response.key).then(res => {
          if (res.status === 200) {
            message.success('上传成功');
            setImgID(res.data.Data.RecordID);
          }
        });
      },
    });
  };
  //导入Excel方法
  const beforeExcelUpload = (file, fileList) => {
    const formData = new FormData();
    formData.append('File', fileList);
    //formData.append('acacode', academyCode);
    //请求导入Excel
    setFormDataGet(formData);
  };

  const moduleExcelDown = () => {
    //单独请求文件下载
    downloadExcelData().then(res => {
      if (res.status === 200) {
        let blobs = res.data;
        let reader = new FileReader();
        reader.readAsDataURL(blobs);
        reader.onload = e => {
          // 转换完成，创建一个a标签用于下载
          let a = document.createElement('a');
          a.download = '模板.xlsx';
          a.href = e.target.result;
          a.click();
          message.success('下载成功');
        };
      } else {
        message.error('获取文件流失败');
      }
    });
  };

  //提交表单
  const submitItem = values => {
    form
      .validateFields()
      .then(values => {
        let params = values;
        params.ParticipateDate = dateString;
        //FormDataGet
        params.File = formDataGet;
        params.Evidence = imgID;
        console.log('Success:', params);
        submitAllSum(params).then(res => {
          console.log(res);
        });
      })
      .catch(errorInfo => {});
  };

  //时间变化
  const onDateChange = (date, dateString) => {
    console.log(dateString);
    setDateString(dateString);
  };
  return (
    <Form
      form={form}
      name="horizontal_login"
      className={styles.formInput}
      onFinish={submitItem}
    >
      {(termVisible === '1' || termVisible === '3') && (
        <Form.Item
          name="AcademicYearCode"
          label="学年："
          rules={[{ required: true, message: '请输入学年!' }]}
        >
          <Select placeholder="请选择" className={styles.selecton}>
            {academicTerm &&
              academicTerm.length > 0 &&
              academicTerm.map(i => (
                <Option value={i.Code} key={i.Code}>
                  {i.Name}
                </Option>
              ))}
          </Select>
        </Form.Item>
      )}
      {termVisible === '1' && (
        <Form.Item
          name="AcademicTermCode"
          label="学期："
          rules={[{ required: true, message: '请输入学期!' }]}
        >
          <Select placeholder="请选择" className={styles.selecton}>
            {academicYear &&
              academicYear.length > 0 &&
              academicYear.map(i => (
                <Option value={i.Code} key={i.Code}>
                  {i.Name}
                </Option>
              ))}
          </Select>
        </Form.Item>
      )}
      <Form.Item
        name="ModuleCode"
        label="模块："
        rules={[{ required: true, message: '请输入模块!' }]}
      >
        <Select
          onChange={moduleChange}
          placeholder="请选择"
          className={styles.selecton}
        >
          {moduleEntry &&
            moduleEntry.length > 0 &&
            moduleEntry.map(i => (
              <Option value={i.code} key={i.code}>
                {i.code_name}
              </Option>
            ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="ItemCode"
        label="项目："
        rules={[{ required: true, message: '请输入项目!' }]}
      >
        <Select
          onChange={itemChange}
          placeholder="请选择"
          className={styles.selecton}
        >
          {objectEntry &&
            objectEntry.length > 0 &&
            objectEntry.map(i => (
              <Option value={i.ItemCode} key={i.ItemCode}>
                {i.ItemName}
              </Option>
            ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="StandardCode"
        label="标准："
        rules={[{ required: true, message: '请输入标准!' }]}
      >
        <Select placeholder="请选择" className={styles.selecton}>
          {standardEntry &&
            standardEntry.length > 0 &&
            standardEntry.map(i => (
              <Option value={i.StandardCode} key={i.StandardCode}>
                {i.StandardName}
              </Option>
            ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="StuName"
        label="时长："
        rules={[{ required: true, message: '请输入时长!' }]}
      >
        <Input
          className={styles.inputSearch}
          placeholder="请输入"
          rules={[{ required: true, message: '请输入时长!' }]}
        />
      </Form.Item>
      <Form.Item
        name="SingleScore"
        label="分值："
        rules={[{ required: true, message: '请输入分值!' }]}
      >
        <Input
          className={styles.inputSearch}
          placeholder="请输入"
          rules={[{ required: true, message: '请输入分值!' }]}
        />
      </Form.Item>
      <Form.Item
        name="ParticipateDate"
        className={styles.dateMark}
        label={
          <span>
            <span className={styles.colorInfo}>*</span> 参与时间
          </span>
        }
        {...rangeConfig}
      >
        <DatePicker onChange={onDateChange} showTime format="YYYY-MM-DD" />
        {/* <RangePicker showTime format="YYYY-MM-DD" /> */}
      </Form.Item>
      <Form.Item
        label={
          <span>
            <span className={styles.colorInfo}>*</span> 参与学生
          </span>
        }
        name="Excel"
        rules={[
          { required: false, message: '请选择附件上传' },
          () => ({
            validator(rule, value) {
              if (fileList.length === 0) {
                return Promise.reject('请填写Excel上传');
              } else {
                return Promise.resolve();
              }
            },
          }),
        ]}
      >
        <Upload
          {...uploadExcelProps}
          beforeUpload={beforeExcelUpload}
          accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className={styles.moduleUp}
        >
          {fileList.length >= 1 ? null : (
            <Button>
              {' '}
              <UploadOutlined /> 上传EXCEL
            </Button>
          )}
        </Upload>
        <Button
          className={styles.moduleDown}
          onClick={moduleExcelDown}
          type="primary"
        >
          下载模板
        </Button>
      </Form.Item>
      <Form.Item
        name="Description"
        label={
          <span>
            <span className={styles.colorInfo}>*</span> 详细说明
          </span>
        }
      >
        <TextArea rows={4} />
      </Form.Item>
      <Form.Item
        name="Evidence"
        label={
          <span>
            <span className={styles.colorInfo}>*</span> 附件上传
          </span>
        }
        rules={[
          { required: false, message: '请选择附件上传' },
          () => ({
            validator(rule, value) {
              if (imgID === '') {
                return Promise.reject('请选择附件上传');
              } else {
                return Promise.resolve();
              }
            },
          }),
        ]}
      >
        <Upload
          listType="picture-card"
          fileList={fileIMGList}
          beforeUpload={beforeIMGUpload}
          onPreview={handlePreview}
          onChange={handleIMGChange}
        >
          {fileIMGList.length >= 1 ? null : (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
        <Modal
          visible={previewVisible}
          title={previewTitle}
          footer={null}
          onCancel={handleIMGCancel}
        >
          <img alt="example" style={{ width: '100%' }} src={previewImage} />
        </Modal>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
});

export default FormEntering;
