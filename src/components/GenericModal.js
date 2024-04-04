import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure
} from '@chakra-ui/react';

const GenericModal = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  onCancel,
  cancelText = 'Cancel',
  isConfirmButtonLoading = false,
  isCancelButtonLoading = false,
}) => {
  const handleCancel = onCancel || onClose;

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <Button variant="ghost" onClick={handleCancel} isLoading={isCancelButtonLoading} mr={3}>
            {cancelText}
          </Button>
          <Button colorScheme="blue" onClick={onConfirm} isLoading={isConfirmButtonLoading}>
            {confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default GenericModal;