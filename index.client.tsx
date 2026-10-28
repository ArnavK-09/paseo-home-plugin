import type { PluginClientContext } from "@getpaseo/plugin/client"
import { HomeSidebarItem } from "./client/home-item"
import { HomeScreen } from "./client/home-screen"

export default function contribute(client: PluginClientContext) {
  client.addScreen({
    id: "home",
    title: "\u200B",
    Component: HomeScreen,
  })
  client.addSidebarHeaderItem({
    id: "home",
    title: "Home",
    Component: HomeSidebarItem,
  })
  return () => {}
}
