import * as React from 'react';
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  makeStyles,
  tokens,
  DialogOpenChangeEvent,
  Select,
  SelectProps,
  Textarea,
  FluentProvider,
  webLightTheme,
} from '@fluentui/react-components';
import { IInvoice } from './InvoiceHub';
import { ICommentInfo } from "@pnp/sp/comments";

// Define styles
const useStyles = makeStyles({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },
  invoiceInfoSection: {
    backgroundColor: tokens.colorNeutralBackground2,
    padding: '16px',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: tokens.colorNeutralForeground2,
  },
  infoValue: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
  },
  select: {
    width: '100%',
    minWidth: '250px',
  },
  commentInputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  commentTextarea: {
    width: '100%',
    minHeight: '80px',
  },
  // commentButtonContainer: {
  //   display: 'flex',
  //   justifyContent: 'flex-end',
  // },
  // commentButton: {
  //   minWidth: '80px',
  // },
  commentsSection: {
    marginTop: '16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    paddingTop: '16px',
  },
  commentsLabel: {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px',
    color: tokens.colorNeutralForeground2,
  },
  commentsContainer: {
    maxHeight: '150px',
    overflowY: 'auto',
    marginTop: '8px',
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      background: tokens.colorNeutralBackground1,
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: tokens.colorNeutralStroke1,
      borderRadius: '3px',
      '&:hover': {
        background: tokens.colorNeutralStroke1Hover,
      },
    },
  },
  commentsContainerExpanded: {
    maxHeight: '200px',
  },
  commentItem: {
    marginBottom: '12px',
    padding: '12px',
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: '4px',
    '&:last-child': {
      marginBottom: '0',
    },
  },
  commentAuthor: {
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '4px',
    color: tokens.colorNeutralForeground1,
  },
  commentText: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground1,
    lineHeight: '20px',
    whiteSpace: 'pre-wrap',
  },
  commentDate: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground2,
    marginTop: '4px',
  },
  noComments: {
    fontSize: '14px',
    color: tokens.colorNeutralForeground2,
    fontStyle: 'italic',
    padding: '8px 12px',
  },
});

interface ICommentInput {
  showInput: boolean;
  comment: string;
  isSubmitting: boolean;
}

interface UpdateInvoiceDialogProps {
  isOpen: boolean;
  selectedInvoice: IInvoice | undefined;
  selectedStatus: string;
  itemComments: ICommentInfo[];
  commentInput: ICommentInput;
  loadingComments: boolean;
  isSaving: boolean;
  statusOptions: readonly string[];
  onClose: () => void;
  onStatusChange: (_event: unknown, data: { value: string }) => void;
  onCommentChange: (comment: string) => void;
  //onCommentSubmit: () => Promise<void>;
  onStatusSave: () => Promise<void>;
  formatCurrency: (amount: number | undefined) => string;
  formatDate: (date: string) => string;
}

export const UpdateInvoiceDialog: React.FC<UpdateInvoiceDialogProps> = ({
  isOpen,
  selectedInvoice,
  selectedStatus,
  itemComments,
  commentInput,
  loadingComments,
  isSaving,
  statusOptions,
  onClose,
  onStatusChange,
  onCommentChange,
  //onCommentSubmit,
  onStatusSave,
  formatCurrency,
  formatDate,
}) => {
  const styles = useStyles();

  const handleOpenChange = (_: DialogOpenChangeEvent, data: { open: boolean }): void => {
    if (!data.open) {
      onClose();
    }
  };
  const hasChanges = (): boolean => {
    return selectedStatus !== selectedInvoice?.Status || commentInput.comment.trim() !== '';
  };

  return (
    <FluentProvider theme={webLightTheme}>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Update Status</DialogTitle>
          <DialogContent>
            <div className={styles.dialogContent}>
              {selectedInvoice && (
                <div className={styles.invoiceInfoSection}>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Invoice Number</span>
                      <span className={styles.infoValue}>
                        {selectedInvoice.InvoiceNumber || '-'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Customer Name</span>
                      <span className={styles.infoValue}>
                        {selectedInvoice.CustomerName || '-'}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Invoice Date</span>
                      <span className={styles.infoValue}>
                        {formatDate(selectedInvoice.InvoiceDate || '')}
                      </span>
                    </div>
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>Total Amount</span>
                      <span className={styles.infoValue}>
                        {formatCurrency(selectedInvoice.TotalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Select
                value={selectedStatus}
                onChange={onStatusChange as SelectProps["onChange"]}
                className={styles.select}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>

              {/* {commentInput.showInput && ( */}
                <div className={styles.commentInputContainer}>
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentInput.comment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    resize="vertical"
                    className={styles.commentTextarea}
                  />
                  {/* <div className={styles.commentButtonContainer}>
                    <Button
                      appearance="primary"
                      onClick={onCommentSubmit}
                      disabled={!commentInput.comment.trim() || commentInput.isSubmitting}
                      className={styles.commentButton}
                    >
                      {commentInput.isSubmitting ? 'Saving...' : 'Comment'}
                    </Button>
                  </div> */}
                </div>
              {/* )} */}

              <div className={styles.commentsSection}>
                <div className={styles.commentsLabel}>Comments History</div>
                {loadingComments ? (
                  <div className={styles.noComments}>Loading comments...</div>
                ) : (
                  <>
                    {itemComments.length > 0 ? (
                      <div className={`${styles.commentsContainer} ${itemComments.length > 3 ? styles.commentsContainerExpanded : ''}`}>
                        {itemComments
                          .sort((a, b) =>
                            new Date(b.createdDate || '').getTime() - new Date(a.createdDate || '').getTime()
                          )
                          .map((comment, index) => (
                            <div key={comment.id || index} className={styles.commentItem}>
                              <div className={styles.commentAuthor}>
                                {comment.author?.name || 'Unknown'}
                              </div>
                              <div className={styles.commentText}>{comment.text}</div>
                              <div className={styles.commentDate}>
                                {formatDate(comment.createdDate || '')}
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className={styles.noComments}>No comments available</div>
                    )}
                  </>
                )}
              </div>
            </div>
          </DialogContent>
          <DialogActions>
            <Button appearance="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={onStatusSave}
              disabled={
                !hasChanges()  ||                
                isSaving
              }
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
    </FluentProvider>
    
  );
};

export default UpdateInvoiceDialog;