'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { Sample } from '@/types/sample';
import { SampleMap } from '@/components/SampleMap';
import StorageSymbol from './StorageSymbol';
import {
  Modal,
  Paper,
  Typography,
  IconButton,
  Grid as MuiGrid,
  Button,
  Box,
  Chip,
  Link,
  styled
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface SampleDetailsModalProps {
  sample: Sample;
  onClose: () => void;
  onAddToCart: (sample: Sample) => void;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '800px',
  width: '90%',
  padding: theme.spacing(4),
  maxHeight: '90vh',
  overflow: 'auto'
}));

const DetailItem = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(2)
}));

export default function SampleDetailsModal({ sample, onClose, onAddToCart }: SampleDetailsModalProps) {
  return (
    <Modal
      open={true}
      onClose={onClose}
      aria-labelledby="sample-details-modal"
      aria-describedby="sample-details-description"
    >
      <StyledPaper elevation={3}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          aria-label="close"
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h4" component="h2" gutterBottom>
          {sample.name}
        </Typography>

        <MuiGrid container component="div" spacing={3}>
          <MuiGrid component="div" item xs={12} md={6}>
            <DetailItem>
              <Typography variant="subtitle1" fontWeight="bold">Type</Typography>
              <Chip
                label={sample.type}
                sx={{
                  bgcolor: sample.type === 'DNA' ? '#e3f2fd' :
                    sample.type === 'RNA' ? '#fce4ec' :
                    sample.type === 'Protein' ? '#f3e5f5' : '#e8f5e9'
                }}
              />
            </DetailItem>
          </MuiGrid>

          <MuiGrid component="div" item xs={12} md={6}>
            <DetailItem>
              <Typography variant="subtitle1" fontWeight="bold">Location</Typography>
              <Typography>{sample.location}</Typography>
            </DetailItem>
          </MuiGrid>

          <MuiGrid item xs={12} md={6}>
            <DetailItem>
              <Typography variant="subtitle1" fontWeight="bold">Price</Typography>
              <Typography>${sample.price.toFixed(2)}</Typography>
            </DetailItem>
          </MuiGrid>

          <MuiGrid item xs={12} md={6}>
            <DetailItem>
              <Typography variant="subtitle1" fontWeight="bold">Collection Date</Typography>
              <Typography>
                {sample.collection_date ? new Date(sample.collection_date).toLocaleDateString() : 'N/A'}
              </Typography>
            </DetailItem>
          </MuiGrid>

          <MuiGrid item xs={12} md={6}>
            <DetailItem>
              <Typography variant="subtitle1" fontWeight="bold">Storage Condition</Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <StorageSymbol condition={sample.storage_condition || ''} id={`modal-${sample.id}`} />
                <Typography>{sample.storage_condition || 'N/A'}</Typography>
              </Box>
            </DetailItem>
          </MuiGrid>

          <MuiGrid item xs={12} md={6}>
            <DetailItem>
              <Typography variant="subtitle1" fontWeight="bold">Availability</Typography>
              <Chip
                label={Number(sample.quantity) > 0 ? `${sample.quantity} Available` : 'Out of Stock'}
                color={Number(sample.quantity) > 0 ? 'success' : 'error'}
              />
            </DetailItem>
          </MuiGrid>

          {sample.institution_contact_name && (
            <MuiGrid item xs={12}>
              <DetailItem>
                <Typography variant="subtitle1" fontWeight="bold">Institution Contact</Typography>
                <Typography>{sample.institution_contact_name}</Typography>
                {sample.institution_contact_email && (
                  <Link href={`mailto:${sample.institution_contact_email}`} color="primary">
                    {sample.institution_contact_email}
                  </Link>
                )}
              </DetailItem>
            </MuiGrid>
          )}
        </MuiGrid>

        <DetailItem>
          <Typography variant="subtitle1" fontWeight="bold">Description</Typography>
          <Typography>{sample.description || 'No description available.'}</Typography>
        </DetailItem>

        {typeof sample.latitude === 'number' && typeof sample.longitude === 'number' && (
          <>
            <DetailItem>
              <Typography variant="subtitle1" fontWeight="bold">Coordinates</Typography>
              <Typography>
                {sample.latitude.toFixed(4)}, {sample.longitude.toFixed(4)}
              </Typography>
            </DetailItem>
            <DetailItem>
              <Typography variant="h6">Sample Location</Typography>
              <Box sx={{ height: '300px', width: '100%', mt: 2 }}>
                <SampleMap samples={[sample]} />
              </Box>
            </DetailItem>
          </>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onAddToCart(sample)}
            disabled={Number(sample.quantity) <= 0}
            startIcon={<FontAwesomeIcon icon={faCartPlus} />}
          >
            {Number(sample.quantity) > 0 ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </Box>
      </StyledPaper>
    </Modal>
  );
} 