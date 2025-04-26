export const login = async (email: string, password: string) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.email === email && user.password === password) {
    localStorage.setItem('isAuthenticated', 'true');
    return true;
  }
  return false;
};

export const register = async (email: string, password: string) => {
  localStorage.setItem('user', JSON.stringify({ email, password }));
  return true;
};

export const logout = () => {
  localStorage.removeItem('isAuthenticated');
};

export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};
