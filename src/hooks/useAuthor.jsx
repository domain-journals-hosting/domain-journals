import { useContext } from "react";
import { AuthContext } from "../context/AuthorContext";

export const useAuth = () => useContext(AuthContext);
