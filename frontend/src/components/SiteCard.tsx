import { useState } from "react"
import {
  Box,
  Heading,
  Text,
  Img,
  Flex,
  Center,
  useColorModeValue,
  HStack,
} from "@chakra-ui/react"
import { Site, SiteSetting, SiteState } from "../contracts/objects"
import { useNavigate } from "react-router-dom"
import { Icon } from "@chakra-ui/react"
import { FaPlug, FaBolt } from "react-icons/fa"
// import { BsArrowUpRight, BsHeartFill, BsHeart } from "react-icons/bs"
interface SiteCardProps {
  site: Site
  site_settings: SiteSetting | undefined
}

const SiteCard: React.FC<SiteCardProps> = ({ site, site_settings }) => {
  let navigate = useNavigate()

  // Check if the timestamp is more than 30 seconds old
  const currentTime = Date.now() // Current time in milliseconds
  const thirtySecondsInMilliseconds = 30 * 1000
  const isOffline =
    !site.last_updated_ms ||
    currentTime - site.last_updated_ms > thirtySecondsInMilliseconds

  console.log(isOffline)

  // Determine the site state based on the timestamp and existing state
  const siteState = isOffline
    ? "Offline"
    : site.state === SiteState.SiteState_ONLINE
    ? "Online"
    : "Offline"
  const backgroundColor = siteState === "Online" ? "#90ee90" : "#ff6b6b"

  // Calculate total power (W) for all plugs
  const totalPower = site.plugs.reduce((sum, plug) => {
    return sum + (plug.reading?.voltage || 0) * (plug.reading?.current || 0)
  }, 0)

  return (
    <Center py={6}>
      <Box
        width={"100%"}
        mx={[2, 4]}
        overflow={"hidden"}
        bg="white"
        border={"1px"}
        borderColor="black"
        boxShadow={useColorModeValue("6px 6px 0 black", "6px 6px 0 cyan")}
        onClick={() => navigate(`/site/${site.site_id}`)}
      >
        <Box p={4}>
          <Heading color={"black"} fontSize={"2xl"} noOfLines={1}>
            {site_settings?.name}
          </Heading>
        </Box>
        <HStack borderTop={"1px"} color="black">
          <Flex
            p={4}
            alignItems="center"
            justifyContent={"start"}
            roundedBottom={"sm"}
            w="full"
          >
            {site_settings?.description}
          </Flex>
        </HStack>
        <Flex borderTop={"1px"} borderBottom={"1px"} color="black" w="full">
          <Flex
            p={4}
            alignItems="center"
            justifyContent={"center"}
            flex={1}
            borderRight={"1px solid black"}
          >
            <Icon as={FaPlug} marginRight={1} />
            <Text fontSize={"md"} fontWeight="medium">
              {site.plug_ids.length}
            </Text>
          </Flex>
          <Flex
            p={4}
            alignItems="center"
            justifyContent={"center"}
            flex={3}
            borderRight={"1px solid black"}
          >
            <Icon as={FaBolt} marginRight={1} />
            <Text fontSize={"md"} fontWeight="medium">
              {Math.round(totalPower)} W
            </Text>
          </Flex>
          <Flex
            p={2}
            alignItems="center"
            justifyContent={"center"}
            flex={1}
            backgroundColor={backgroundColor}
          >
            <Text fontSize={"lg"} fontWeight="medium">
              {siteState}
            </Text>
          </Flex>
        </Flex>
      </Box>
    </Center>
  )
}

export default SiteCard
