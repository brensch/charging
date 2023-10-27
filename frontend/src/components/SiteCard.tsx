"use client"

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
// import { BsArrowUpRight, BsHeartFill, BsHeart } from "react-icons/bs"

export default function PostWithLike() {
  const [liked, setLiked] = useState(false)

  return (
    <Center py={6}>
      <Box
        // w="xs"
        rounded={"sm"}
        // my={5}
        mx={[2, 5]}
        overflow={"hidden"}
        bg="white"
        border={"1px"}
        borderColor="black"
        boxShadow={useColorModeValue("6px 6px 0 black", "6px 6px 0 cyan")}
      >
        <Box p={4}>
          <Box
            bg="black"
            display={"inline-block"}
            px={2}
            py={1}
            color="white"
            mb={2}
          >
            <Text fontSize={"xs"} fontWeight="medium">
              New
            </Text>
          </Box>
          <Heading color={"black"} fontSize={"2xl"} noOfLines={1}>
            Brendo Pi
          </Heading>
          <Text color={"gray.500"} noOfLines={2}>
            In this post, we will give an overview of what is new in React 18,
            and what it means for the future.
          </Text>
        </Box>
        <HStack borderTop={"1px"} color="black">
          <Flex
            p={4}
            alignItems="center"
            justifyContent={"space-between"}
            roundedBottom={"sm"}
            cursor={"pointer"}
            w="full"
          >
            <Text fontSize={"md"} fontWeight={"semibold"}>
              View more
            </Text>
            {/* <BsArrowUpRight /> */}
          </Flex>
          <Flex
            p={4}
            alignItems="center"
            justifyContent={"space-between"}
            roundedBottom={"sm"}
            borderLeft={"1px"}
            cursor="pointer"
            onClick={() => setLiked(!liked)}
          >
            hi
            {/* {liked ? (
              <BsHeartFill fill="red" fontSize={"24px"} />
            ) : (
              <BsHeart fontSize={"24px"} />
            )} */}
          </Flex>
        </HStack>
        <HStack borderTop={"1px"} color="black">
          <Flex
            p={4}
            alignItems="center"
            justifyContent={"space-between"}
            roundedBottom={"sm"}
            cursor={"pointer"}
            // w="full"
          >
            <Text fontSize={"md"} fontWeight={"semibold"}>
              View more
            </Text>
            {/* <BsArrowUpRight /> */}
          </Flex>
          <Flex
            p={4}
            alignItems="center"
            justifyContent={"space-between"}
            roundedBottom={"sm"}
            borderLeft={"1px"}
            cursor="pointer"
            onClick={() => setLiked(!liked)}
          >
            hi
            {/* {liked ? (
              <BsHeartFill fill="red" fontSize={"24px"} />
            ) : (
              <BsHeart fontSize={"24px"} />
            )} */}
          </Flex>
        </HStack>
      </Box>
    </Center>
  )
}
