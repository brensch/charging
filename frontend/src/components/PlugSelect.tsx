import React, { useState, FormEvent } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Input,
  InputGroup,
  InputRightAddon,
  InputRightElement,
} from "@chakra-ui/react"

function Page() {
  const [code, setCode] = useState<string>("")
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    navigate(`${code}`)
  }

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <InputGroup mt={4}>
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter Plug Code"
            pr="4.5rem"
          />
          <InputRightElement width="4.5rem">
            <Button type="submit" h="1.75rem">
              Go
            </Button>
          </InputRightElement>
        </InputGroup>
      </form>
      <Outlet />
    </Box>
  )
}

export default Page
