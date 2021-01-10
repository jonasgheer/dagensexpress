import {
    Button,
    Container,
    ContainerProps,
    Heading,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
} from "@chakra-ui/react";
import * as React from "react";
import { useState } from "react";

export type AlternativeState = "normal" | "selected" | "disabled";

export function Alternative({
    text,
    onSubmit,
    state = "normal",
    answer = false,
}: {
    text: string;
    onSubmit?: () => void;
    state?: AlternativeState;
    answer?: boolean;
}) {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    let style: ContainerProps;
    switch (state) {
        case "normal":
            style = {
                _hover: {
                    cursor: "pointer",
                    boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
                },
            };
            break;
        case "selected":
            style = {
                boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
            };
            break;

        case "disabled":
            style = {
                color: "gray.300",
            };
    }

    return (
        <>
            <Modal isOpen={modalIsOpen} onClose={() => setModalIsOpen(false)}>
                <ModalOverlay>
                    <ModalContent>
                        <ModalHeader />
                        <ModalCloseButton colorScheme="gray" />
                        <ModalBody textAlign="center">
                            <Heading fontSize="1.5em">Er du sikker?</Heading>
                        </ModalBody>
                        <ModalFooter justifyContent="center">
                            <Button colorScheme="gray" onClick={onSubmit}>
                                Aldri vært så sikker i mitt liv!
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </ModalOverlay>
            </Modal>
            <Container
                {...style}
                rounded="5px"
                m="0"
                maxW="none"
                p="3"
                bg={answer ? "green.50" : "white"}
                fontSize="1.2rem"
                boxShadow="0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)"
                onClick={() =>
                    state === "normal" && onSubmit && setModalIsOpen(true)
                }
            >
                {text}
            </Container>
        </>
    );
}
