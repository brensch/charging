import {
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  Center,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react"
import { Plug, PlugState, plugStateToJSON } from "../contracts/objects"

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
        maxW="sm"
        borderRadius="sm"
        overflow="hidden"
        borderColor="black"
        border="1px"
        boxShadow={useColorModeValue("6px 6px 0 black", "6px 6px 0 cyan")}
        p={5}
        bg={useColorModeValue("white", "gray.800")}
      >
        <Box p={4}>
          <Text fontWeight="bold" fontSize="xl">
            Plug {plugData.plug_id}
          </Text>
          <Text fontSize="l">{plugStateToJSON(plugData.reading.state)}</Text>
          <Stat>
            <StatLabel>Amps</StatLabel>
            <StatNumber>
              {Number(plugData.reading.current).toFixed(2)}A
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Voltage</StatLabel>
            <StatNumber>
              {Number(plugData.reading.voltage).toFixed(2)}V
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Power Factor</StatLabel>
            <StatNumber>
              {Number(plugData.reading.power_factor).toFixed(2)}
            </StatNumber>
          </Stat>
          <Text fontSize="sm">
            Last Reading:{" "}
            {new Date(plugData.reading.timestamp * 1000).toLocaleDateString()}{" "}
            {new Date(plugData.reading.timestamp * 1000).toLocaleTimeString()}
          </Text>
        </Box>
        <HStack borderTop="1px" borderColor="black" spacing={4}>
          <Text fontSize="xs" p={4} fontWeight="medium" flex={1}>
            Reading Data
          </Text>
          {/* You can add more tags or controls here */}
        </HStack>
        <HStack borderTop="1px" borderColor="black" spacing={4}>
          {/* This is for the bottom controls. Similar to the SiteCard */}
        </HStack>
      </Box>
    </Center>
  )
}

export default PlugStateCard
