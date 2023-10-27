import { useState } from "react"
import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  useColorModeValue,
  Center,
  Flex,
} from "@chakra-ui/react"

export default function PostWithLike() {
  const [liked, setLiked] = useState(false)

  // Define the type for Tag props
  type TagProps = {
    label: string
  }

  // Reusable component for tags
  const Tag: React.FC<TagProps> = ({ label }) => (
    <GridItem
      bg="white"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box bg="black" px={2} py={1} color="white" marginRight={2}>
        <Text fontSize={"xs"} fontWeight="medium">
          {label}
        </Text>
      </Box>
    </GridItem>
  )

  return (
    <Center py={6}>
      <Box
        rounded={"sm"}
        mx={[2, 5]}
        overflow={"hidden"}
        bg="black" // Setting the overall background to black
        border={"1px"}
        borderColor="black"
        boxShadow={useColorModeValue("6px 6px 0 black", "6px 6px 0 cyan")}
      >
        <Grid gap={"1px"}>
          <GridItem bg="white" p={4} colSpan={3}>
            <Heading color={"black"} fontSize={"2xl"} noOfLines={1}>
              Brendo Pi
            </Heading>
            <Text color={"gray.500"} noOfLines={2}>
              Shady garage with free beer on tap
            </Text>
          </GridItem>
          <GridItem bg="white" p={4} colSpan={3}>
            <Flex
              alignItems="center"
              justifyContent={"start"}
              roundedBottom={"sm"}
              w="full"
            >
              <Box
                bg="black"
                display={"inline-block"}
                px={2}
                py={1}
                color="white"
                marginRight={2}
              >
                <Text fontSize={"xs"} fontWeight="medium">
                  Shady
                </Text>
              </Box>
              <Box
                bg="black"
                display={"inline-block"}
                px={2}
                py={1}
                color="white"
                marginRight={2}
              >
                <Text fontSize={"xs"} fontWeight="medium">
                  Beer
                </Text>
              </Box>
              <Box
                bg="black"
                display={"inline-block"}
                px={2}
                py={1}
                color="white"
                marginRight={2}
              >
                <Text fontSize={"xs"} fontWeight="medium">
                  Shady
                </Text>
              </Box>
            </Flex>
          </GridItem>

          <GridItem colSpan={2} bg="white">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={() => setLiked(!liked)}
              width="100%"
              height="100%"
              p={4}
            >
              New
            </Box>
          </GridItem>

          <GridItem colSpan={1} bg="white">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={() => setLiked(!liked)}
              width="100%"
              height="100%"
              p={4}
            >
              hi
            </Box>
          </GridItem>
        </Grid>
      </Box>
    </Center>
  )
}
