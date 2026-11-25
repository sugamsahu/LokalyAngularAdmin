import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { AuthModel } from "../models/auth.model";

@Injectable({
  providedIn: "root",
})
export class AjaxService {
  private baseUrl: string;
  private baseUrl2: string;
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.apiUrl;
    this.baseUrl2 = environment.apiUrl2;
  }

  private getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  createAuthorizationHeader() {
    let headers: HttpHeaders = new HttpHeaders();
    var token = localStorage.getItem('accessToken')
    headers = headers.append("Content-Type", "application/json; charset=utf-8");
    headers = headers.append("token", token ? token : '' );
    headers = headers.append("App-Version", "2.2.1");
    headers = headers.append("Language-Code", "en");
    headers = headers.append("Device-Id", "null");
    return headers;
  }

  createAuthorizationHeaderFormData() {
    let headers: HttpHeaders = new HttpHeaders();
    var token = localStorage.getItem('accessToken')
    headers = headers.append("token", token ? token : '');
    headers = headers.append("App-Version", "2.2.1");
    headers = headers.append("Language-Code", "en");
    headers = headers.append("Device-Id", "null");
    return headers;
  }

  createForDataAuthorizationHeader() {
    let headers: HttpHeaders = new HttpHeaders();
    const auth = this.getAuthFromLocalStorage();
    headers = headers.append("Authorization", "Bearer " + auth?.authToken);
    return headers;
  }

  get(url: string) {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.baseUrl}/${url}`, { headers: headers });
  }

  get2(url: string) {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.baseUrl2}/${url}`, { headers: headers });
  }

  getById(id: number, url: string) {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.baseUrl}/${url}/${id}`, {
      headers: headers,
    });
  }

  getwithdata(data: any, url: string) {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(
      `${this.baseUrl}/${url}?` + this.paginationStringReturn(data),
      { headers: headers }
    );
  }

  getwithdata2(data: any, url: string) {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(
      `${this.baseUrl2}/${url}?` + this.paginationStringReturn(data),
      { headers: headers }
    );
  }

  getwithdata3(data: any, url: string) {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(
      `${this.baseUrl}/${url}?` + this.dataForHistory(data),
      { headers: headers }
    );
  }

  put(data: any, id: number, url: string) {
    const headers = this.createAuthorizationHeader();
    return this.http.put<any>(`${this.baseUrl}/${url}/${Number(id)}`, data, {
      headers: headers,
    });
  }

  get3(data: any, id: number, url: string) {
    const headers = this.createAuthorizationHeader();
    return this.http.get<any>(`${this.baseUrl}/${url}/${Number(id)}`, data);
  }

  putFomdata(data: any, url: string) {
    const headers = this.createAuthorizationHeaderFormData();
    return this.http.put<any>(`${this.baseUrl}/${url}`, data, {
      headers: headers,
    });
  }

  // getFomdata(data: any, url: string) {
  //   const headers = this.createAuthorizationHeaderFormData();
  //   return this.http.get<any>(`${this.baseUrl}/${url}`, data, {
  //     headers: headers,
  //   });
  // }
  
  getFormdata(data: any, url: string) {
    const headers = this.createAuthorizationHeaderFormData();
    return this.http.put<any>(`${this.baseUrl}/${url}`, data, {
      headers: headers,
    });
  }

  delete(id: number, url: string) {
    const headers = this.createAuthorizationHeader();
    return this.http.delete<any>(`${this.baseUrl}/${url}/${Number(id)}`, {
      headers: headers,
    });
  }

  paginationStringReturn(data: any ) {
    return (
      "page=" +
      data.page +
      "&search_string=" +
      data.search_string +
      "&sort_by=" +
      data.sort_by +
      "&sort_direction=" +
      data.sort_direction + '&size=' + data.size +
      "&query_status=" +
      data.query_status
    );
  }

  dataForHistory(data: any) {
    if (data.store_id){
      return (
        "created_by_id=" + data.created_by_id +
        "&store_id=" + data.store_id +
        "&page=" + data.page +
        "&size=" + data.size +
        "&sort_direction=" + data.sort_direction + 
        "&sort_by=" + data.sort_by
      )
    }else{
      return (
        "created_by_id=" + data.created_by_id +
        "&page=" +
        data.page +
        "&size=" + data.size +
        "&sort_direction=" + data.sort_direction + 
        "&sort_by=" + data.sort_by
      )
    }
   
  }

  post(data: any, url: string) {
    const headers = this.createAuthorizationHeader();
    return this.http.post<any>(`${this.baseUrl}/${url}`, data, {
      headers: headers,
    });
  }

  // post3(data: any, url: string) {
  //   const headers = this.createAuthorizationHeader();
  //   return this.http.post<any>(`${this.baseUrl3}/${url}`, data, {
  //     headers: headers,
  //   });
  // }

  post2(data: any, url: string) {
    const headers = this.createAuthorizationHeader();
    return this.http.post<any>(`${this.baseUrl2}/${url}`, data, {
      headers: headers,
    });
  }

  formData(data: any, url: string) {
    const headers = this.createAuthorizationHeaderFormData();
    return this.http.post<any>(`${this.baseUrl}/${url}`, data, {
      headers: headers,
    });
  }

  formData2(data: any, url: string) {
    const headers = this.createAuthorizationHeaderFormData();
    return this.http.post<any>(`${this.baseUrl2}/${url}`, data, {
      headers: headers,
    });
  }

  // formData3(data: any, url: string) {
  //   const headers = this.createAuthorizationHeaderFormData();
  //   return this.http.post<any>(`${this.baseUrl3}/${url}`, data, {
  //     headers: headers,
  //   });
  // }

  postwithIDData(data: any, id: number, url: string) {
    const headers = this.createForDataAuthorizationHeader();
    return this.http.post<any>(`${this.baseUrl}/${url}/${Number(id)}`, data, {
      headers: headers,
    });
  }
}