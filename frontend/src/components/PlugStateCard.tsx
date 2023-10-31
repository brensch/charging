import {
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  HStack,
  Center,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react"
import { Plug, PlugState, plugStateToJSON } from "../contracts/objects"
import { Icon } from "@chakra-ui/react"
import { FaPlug } from "react-icons/fa"

interface PlugStateCardProps {
  plugData: Plug
}

const PlugStateCard: React.FC<PlugStateCardProps> = ({ plugData }) => {
  if (!plugData.reading) {
    return null
  }

  return (
    <Center py={6}>
      <Box
        width={"100%"}
        maxW="sm"
        borderRadius="sm"
        overflow="hidden"
        borderColor="black"
        border="1px"
        boxShadow={useColorModeValue("6px 6px 0 black", "6px 6px 0 cyan")}
        bg={useColorModeValue("white", "gray.800")}
      >
        <HStack h="100%" spacing={0}>
          <Flex
            alignItems="center"
            justifyContent={"start"}
            roundedBottom={"sm"}
            cursor={"pointer"}
            w="full"
            h="100%"
            marginLeft={2}
          >
            <Icon as={FaPlug} />
            <Text fontSize={"lg"} fontWeight="medium" px={2}>
              {plugData.plug_id}
            </Text>
          </Flex>
          <Flex
            alignItems="center"
            justifyContent={"center"}
            h="100%"
            borderLeft={"1px"}
            cursor="pointer"
            backgroundColor={
              plugData.reading.state === PlugState.PlugState_ON
                ? "#90ee90"
                : "#ff6b6b"
            }
            px={4}
          >
            <Text fontSize={"lg"} fontWeight="medium" px={4}>
              {plugData.reading.state === PlugState.PlugState_ON ? "On" : "Off"}
            </Text>
          </Flex>
        </HStack>
        <HStack borderTop={"1px"} color="black">
          <Box p={4} w="full">
            <Stat>
              <StatLabel>Amps</StatLabel>
              <StatNumber>
                {Number(plugData.reading.current).toFixed(2)}A
              </StatNumber>
            </Stat>
          </Box>
          <Box p={4} w="full" borderLeft={"1px"}>
            <Stat>
              <StatLabel>Voltage</StatLabel>
              <StatNumber>
                {Number(plugData.reading.voltage).toFixed(2)}V
              </StatNumber>
            </Stat>
          </Box>
        </HStack>
        <HStack borderTop={"1px"} color="black" p={4}>
          <Text fontSize="sm">
            Last Reading:{" "}
            {new Date(plugData.reading.timestamp * 1000).toLocaleDateString(
              undefined,
              { day: "2-digit", month: "short" },
            )}{" "}
            {new Date(plugData.reading.timestamp * 1000).toLocaleTimeString()}
          </Text>
        </HStack>
      </Box>
    </Center>
  )
}

export default PlugStateCard
