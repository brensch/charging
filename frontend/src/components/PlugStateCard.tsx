import {
  Box,
  Flex,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Switch,
  FormControl,
  FormLabel,
  Spacer,
  Grid,
} from "@chakra-ui/react"
import { Plug, PlugState, plugStateToJSON } from "../contracts/objects"

interface PlugStateCardProps {
  plugData: Plug
}

const PlugStateCard: React.FC<PlugStateCardProps> = ({ plugData }) => {
  if (!plugData.reading) {
    return
  }
  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="xl"
      p={5}
      bg={useColorModeValue("white", "gray.800")}
      width="100%"
    >
      <Grid templateColumns="1fr 1fr" gap={4} mb={4}>
        <Text fontWeight="bold" fontSize="xl">
          Plug {plugData.plug_id}
        </Text>
        <Text fontSize="l">{plugStateToJSON(plugData.reading.state)}</Text>
      </Grid>

      <Grid templateColumns="1fr 1fr" gap={4}>
        <Stat>
          <StatLabel>Amps</StatLabel>
          <StatNumber>
            {Number(plugData.reading.current).toFixed(2)}A
          </StatNumber>
        </Stat>
        <Stat>
          <StatLabel>Voltage </StatLabel>
          <StatNumber>
            {Number(plugData.reading.voltage).toFixed(2)}V
          </StatNumber>
        </Stat>
      </Grid>

      <Grid templateColumns="1fr 1fr" gap={4} mt={4}>
        <Stat>
          <StatLabel>Power Factor</StatLabel>
          <StatNumber>
            {Number(plugData.reading.power_factor).toFixed(2)}
          </StatNumber>
        </Stat>
        <Text fontSize="sm" gridColumn="span 2">
          Last Reading:{" "}
          {new Date(plugData.reading.timestamp * 1000).toLocaleDateString()}{" "}
          {new Date(plugData.reading.timestamp * 1000).toLocaleTimeString()}
        </Text>
      </Grid>
    </Box>
  )
}

export default PlugStateCard
