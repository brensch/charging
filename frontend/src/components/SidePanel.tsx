import React, { useState } from "react"
import { Box, Button, VStack, Collapse, Icon } from "@chakra-ui/react"
import { Link as RouterLink, useLocation } from "react-router-dom"
import routes, { RouteConfig } from "../routes"
import { ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons"

function SidePanel() {
  const location = useLocation()
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null)

  const renderRoutes = (routes: RouteConfig[], parentPath = "") => {
    return routes.map((route) => {
      const fullPath = `${parentPath}${parentPath.endsWith("/") ? "" : "/"}${
        route.path
      }`
      const isActive = location.pathname.includes(fullPath)
      const isExpandable = Boolean(route.children)

      return (
        <Box key={fullPath}>
          <Button
            as={RouterLink}
            to={fullPath}
            leftIcon={
              isExpandable &&
              (expandedRoute === fullPath ? (
                <ChevronDownIcon />
              ) : (
                <ChevronRightIcon />
              ))
            }
            onClick={() =>
              route.children
                ? setExpandedRoute(expandedRoute === fullPath ? null : fullPath)
                : null
            }
            variant="ghost"
            justifyContent="flex-start"
            fontWeight={isActive ? "bold" : "normal"}
          >
            {fullPath}
          </Button>
          {route.children && (
            <Collapse in={expandedRoute === fullPath}>
              <VStack align="start" pl="4" spacing="1">
                {renderRoutes(route.children, fullPath)}
              </VStack>
            </Collapse>
          )}
        </Box>
      )
    })
  }

  return (
    <VStack align="start" spacing="2">
      {renderRoutes(routes)}
    </VStack>
  )
}

export default SidePanel
