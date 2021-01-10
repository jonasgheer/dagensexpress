import { Container, Flex } from "@chakra-ui/react";
import * as React from "react";

export function UserCard({ username }: { username: string }) {
    return (
        <Flex rounded="5px" mb="3" bg="white">
            {/* <Box roundedLeft="5px" w="3" bg={color} /> */}
            <Container>{username}</Container>
        </Flex>
    );
}
