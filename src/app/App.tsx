import { AppShell } from "./layout/AppShell";
import { DocumentStoreProvider } from "../store/documentStore";

export const App = () => (
  <DocumentStoreProvider>
    <AppShell />
  </DocumentStoreProvider>
);
