import { AuthModel } from './auth.model';

export class LoginModel extends AuthModel {
    id: number;
    company_id:string;
    name:string;
    email:string;
    email_verified_at:string;
    contact_number:string;
    address:string;
    city:string;
    state:string;
    country_id:string;
    zip_code:string;
    created_at:string;
    updated_at:string;
    token:string;
    user_roles: [];

  setUser(_user: unknown) {
    const user = _user as LoginModel;
    this.id = user.id;
    this.company_id = user.company_id || '';
    this.name = user.name || '';
    this.email = user.email || '';
    this.email_verified_at = user.email_verified_at || '';
    this.contact_number = user.contact_number || '';
    this.address = user.address || '';
    this.city = user.city || '';
    this.state = user.state || '';
    this.country_id = user.country_id || '';
    this.zip_code = user.zip_code || '';
    this.created_at = user.created_at || '';
    this.updated_at = user.updated_at || '';
    this.token = user.token || '';
    this.user_roles = user.user_roles || [];
  }
}
