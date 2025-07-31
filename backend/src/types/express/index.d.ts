import { User } from '../../models/user'; // adjust path if needed

declare global {
  namespace Express {
    interface Request {
      user?: User; // or whatever type you assigned
    }
  }
}
