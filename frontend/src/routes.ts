import Home from "./components/Home"
import Account from "./components/Account"
import AccountTopupPreferences from "./components/AccountTopupPreferences"
import Sites from "./components/Sites"
import SiteDetails from "./components/SiteDetails"
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
  },
  {
    path: "autotopup",
    component: AccountTopupPreferences,
  },
  {
    path: "sites",
    component: Sites,
  },
  {
    path: "site/:id",
    component: SiteDetails,
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
  {
    path: "site",
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
