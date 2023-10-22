// routes.ts

import Home from "./components/Home"
import Account from "./components/Account"
import AccountProfile from "./components/AccountProfile"
import AccountBilling from "./components/AccountBilling"
import AccountDelete from "./components/AccountDelete"
import Network from "./components/Network"
import NetworkNewPlug from "./components/NetworkNewPlug"
import PlugDetail from "./components/PlugDetail"
import PlugSelect from "./components/PlugSelect"
import PlugStatus from "./components/PlugStatus"
import PlugSettings from "./components/PlugSettings"

export interface RouteConfig {
  path: string
  component: React.ComponentType
  children?: RouteConfig[]
  exact?: boolean
}

const routes: RouteConfig[] = [
  {
    path: "",
    component: Home,
    exact: true,
  },
  {
    path: "account",
    component: Account,
    children: [
      {
        path: "profile",
        component: AccountProfile,
      },
      {
        path: "billing",
        component: AccountBilling,
      },
      {
        path: "delete",
        component: AccountDelete,
      },
    ],
  },
  {
    path: "network",
    component: Network,
    children: [
      {
        path: "new",
        component: NetworkNewPlug,
      },
    ],
  },

  {
    path: "plug",
    component: PlugSelect,
    children: [
      {
        path: ":id",
        component: PlugDetail,
        children: [
          {
            path: "status",
            component: PlugStatus,
          },
          {
            path: "settings",
            component: PlugSettings,
          },
        ],
      },
    ],
  },
]

export default routes
