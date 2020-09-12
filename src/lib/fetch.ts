import axios from './request';
import { message } from 'antd';

const baseUrl = '/h5api/v1/school';

let req = {
  get(url: string) {
    url = url[0] !== '/' ? baseUrl + url : baseUrl + '/' + url;
    return axios.get(url);
  },

  post(url: string, params: any) {
    url = url[0] !== '/' ? baseUrl + url : baseUrl + '/' + url;
    return axios.post(url, JSON.stringify(params));
  },
  put(url: string, params: any) {
    url = url[0] !== '/' ? baseUrl + url : baseUrl + '/' + url;
    return axios.put(url, JSON.stringify(params));
  },
  delete(url: string, params: any) {
    url = url[0] !== '/' ? baseUrl + url : baseUrl + '/' + url;
    return axios.delete(url);
  },

  postJSON(
    { Router = '', Method = '', Body = {} },
    url = '/api/staff/interface',
  ) {
    return axios
      .post(
        url,
        JSON.stringify({
          Router: Router,
          Method: Method || 'POST',
          Body: JSON.stringify(Body) || '{}',
        }),
      )
      .then(r => {
        const data = r.data;
        if (data.FeedbackCode === 1) {
          message.info('接口访问异常!');
        } else {
          return r;
        }
      })
      .catch(() => {
        message.info('接口访问异常!');
      });
  },
  /**
   *
   * @param formData
   * @param callBack
   * @param url
   */
  postFormData(formData: any, callBack: any, url: string = '/api/staff/file') {
    var token = window['__AppWebkey'];
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('AccessToken', token);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status === 200) {
        callBack(JSON.parse(xhr.responseText));
      } else {
        console.log('Http status: ' + xhr.status + ' , ' + xhr.statusText);
      }
    };
    xhr.send(formData);
  },
  loadBizCode(code = '') {
    return req.postJSON({
      Router: '/api/classinfo/parameterinit',
      Method: 'POST',
      Body: {
        parameter: [code],
      },
    });
  },
};

export default req;
