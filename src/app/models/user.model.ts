// Interface pour l'enregistrement d'un utilisateur
export interface UserRegister {
    username: string;
    email: string;
    password: string;
    role: string;
  }
  // Interface pour la réponse de l'API
  export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any;
  }
  export interface User {
    id?: string;
    username: string;
    email: string;
    password: string;
  }