import {
    Container,
    Flex,
    Heading,
    SimpleGrid,
    Spinner,
} from "@chakra-ui/react";
import * as React from "react";
import { useContext } from "react";
import useFetch, { CachePolicies } from "use-http";
import { QuizState } from "../../../common/types";
import { Alternative, AlternativeState } from "../Alternative";
import { UserContext } from "../App";
import { UserCard } from "../UserCard";

export function UserHome({ refresh, jwt }: { refresh: number; jwt: string }) {
    const user = useContext(UserContext);
    const { get, response, error, loading, data } = useFetch<QuizState>(
        "/hub",
        {
            headers: { Authorization: jwt },
            cachePolicy: CachePolicies.NO_CACHE,
        },
        [refresh]
    );

    async function submitGuess(alternative: number) {
        await get(`/guess/${alternative}`);
    }

    if (loading) {
        return (
            <Flex justifyContent="center" alignItems="center">
                <Spinner colorScheme="gray" size="xl" />;
            </Flex>
        );
    }

    if (data?.type === "nothingHere") {
        return (
            <Flex
                alignSelf="center"
                justifyContent="center"
                maxWidth="700px"
                minWidth="90%"
                flexDir="column"
                textAlign="center"
            >
                <Heading fontStyle="italic">*trommevirvel*</Heading>
            </Flex>
        );
    }

    if (data?.type === "showingQuestion") {
        return (
            <Flex
                alignSelf="center"
                justifyContent="center"
                minWidth="900px"
                maxWidth="90%"
                flexDir="column"
                textAlign="center"
            >
                <Container
                    rounded="5px"
                    fontSize="1.5rem"
                    bg="white"
                    p="5"
                    mb="5"
                    boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                >
                    {data.text}
                </Container>
                <SimpleGrid columns={2} spacing={5}>
                    {Object.entries(data.alternatives).map(([n, text]) => {
                        let state: AlternativeState = "disabled";
                        if (Number(n) === data.haveGuessed) {
                            state = "selected";
                        } else if (!data.haveGuessed) {
                            state = "normal";
                        }
                        return (
                            <Alternative
                                key={n}
                                text={text}
                                state={state}
                                onSubmit={() => submitGuess(Number(n))}
                            />
                        );
                    })}
                </SimpleGrid>
            </Flex>
        );
    }

    if (data?.type === "showingGuesses") {
        return (
            <Flex
                alignSelf="center"
                justifyContent="center"
                minWidth="900px"
                maxWidth="90%"
                flexDir="column"
                textAlign="center"
            >
                <Container
                    rounded="5px"
                    fontSize="1.5rem"
                    bg="white"
                    p="5"
                    mb="5"
                    boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                >
                    {data.text}
                </Container>
                <Flex alignItems="flex-end" justifyContent="space-around">
                    {Object.entries(data.alternatives).map(([n, text]) => {
                        return (
                            <Flex key={n} direction="column" m="2">
                                {Object.entries(data.guesses)
                                    .filter(([_, nr]) => nr === Number(n))
                                    .map(([username, nr]) => (
                                        <UserCard
                                            key={nr}
                                            username={username}
                                        />
                                    ))}

                                <Container
                                    rounded="5px"
                                    bg="white"
                                    p="3"
                                    boxShadow={
                                        user &&
                                        Number(n) ===
                                            data.guesses[user.username]
                                            ? "inset 0 2px 4px 0 rgba(0,0,0,0.06)"
                                            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                                    }
                                    key={n}
                                >
                                    {text}
                                </Container>
                            </Flex>
                        );
                    })}
                </Flex>
            </Flex>
        );
    }

    if (data?.type === "showingAnswer") {
        return (
            <Flex
                alignSelf="center"
                justifyContent="center"
                minWidth="900px"
                maxWidth="90%"
                flexDir="column"
                textAlign="center"
            >
                <Container
                    rounded="5px"
                    fontSize="1.5rem"
                    bg="white"
                    p="5"
                    mb="5"
                    boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                >
                    {data.text}
                </Container>
                <Flex alignItems="flex-end" justifyContent="space-around">
                    {Object.entries(data.alternatives).map(([n, text]) => {
                        return (
                            <Flex key={n} direction="column" m="2">
                                {Object.entries(data.guesses)
                                    .filter(([_, nr]) => nr === Number(n))
                                    .map(([username, nr]) => (
                                        <UserCard
                                            key={nr}
                                            username={username}
                                        />
                                    ))}

                                <Container
                                    rounded="5px"
                                    color={
                                        data.answer === Number(n)
                                            ? "white"
                                            : "black"
                                    }
                                    fontWeight={
                                        data.answer === Number(n)
                                            ? "bold"
                                            : "normal"
                                    }
                                    bg={
                                        data.answer === Number(n)
                                            ? "green.600"
                                            : "white"
                                    }
                                    p="3"
                                    boxShadow={
                                        user &&
                                        Number(n) ===
                                            data.guesses[user.username]
                                            ? "inset 0 2px 4px 0 rgba(0,0,0,0.06)"
                                            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                                    }
                                    key={n}
                                >
                                    {text}
                                </Container>
                            </Flex>
                        );
                    })}
                </Flex>
            </Flex>
        );
    }
    return <p>{data?.type}</p>;
}
