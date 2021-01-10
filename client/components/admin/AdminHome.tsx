import {
    Button,
    Container,
    Flex,
    Heading,
    SimpleGrid,
    Spinner,
} from "@chakra-ui/react";
import * as React from "react";
import { useContext } from "react";
import useFetch, { CachePolicies } from "use-http";
import { AdminQuizState, nextQuestionState } from "../../../common/types";
import { Alternative } from "../Alternative";
import { UserContext } from "../App";
import { UserCard } from "../UserCard";

export function AdminHome({ refresh, jwt }: { refresh: number; jwt: string }) {
    const user = useContext(UserContext);
    const { get, response, error, loading, data } = useFetch<AdminQuizState>(
        "/hub/admin",
        {
            headers: { Authorization: jwt },
            cachePolicy: CachePolicies.NO_CACHE,
        }
    );

    React.useEffect(() => {
        get();
    }, [refresh]);

    let mainContent: JSX.Element | null = null;

    if (loading) {
        return (
            <Flex justifyContent="center" alignItems="center">
                <Spinner colorScheme="gray" size="xl" />;
            </Flex>
        );
    }

    if (error) {
        return <p>noe gikk galt</p>;
    }

    if (data?.type === "finished") {
        return <p>Over for i dag</p>;
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
        mainContent = (
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
                        return (
                            <Alternative
                                key={n}
                                text={text}
                                answer={Number(n) === data.answer}
                            />
                        );
                    })}
                </SimpleGrid>
                <Flex>
                    {Object.entries(data.guesses).map(([username, nr]) => (
                        <Container key={nr}>
                            {username} - {nr}
                        </Container>
                    ))}
                </Flex>
            </Flex>
        );
    }

    if (data?.type === "showingGuesses") {
        mainContent = (
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
                                    bg={
                                        data.answer === Number(n)
                                            ? "green.50"
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

    if (data?.type === "showingAnswer") {
        mainContent = (
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

    return (
        <main>
            <Button
                bg="white"
                colorScheme="gray"
                onClick={() =>
                    fetch(
                        `/hub/today?questionState=${
                            nextQuestionState[data.type]
                        }`,
                        {
                            headers: {
                                Authorization:
                                    localStorage.getItem("jwt") ?? "okey",
                            },
                        }
                    )
                }
            >
                Gå videre
            </Button>
            {mainContent}
        </main>
    );
}
