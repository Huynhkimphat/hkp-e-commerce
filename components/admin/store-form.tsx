'use client';

import { useToast } from '@/hooks/use-toast';
import { StoreSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import slugify from 'slugify';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { createStore } from '@/lib/actions/store.actions';
import { Card, CardContent } from '../ui/card';
import Image from 'next/image';
import { UploadButton } from '@/lib/uploadthing';

const StoreForm = ({
  type,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  store,
}: {
  type: 'Create' | 'Update' | 'Edit';
  store?: z.infer<typeof StoreSchema>;
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof StoreSchema>>({
    resolver: zodResolver(StoreSchema),
    defaultValues: {
      storeName: '',
      slug: '',
      description: '',
      productName: '',
      category: '',
      brand: '',
      price: '',
      stock: 0,
      image: '',
    },
  });

  const image = form.watch('image');

  const onSubmit: SubmitHandler<z.infer<typeof StoreSchema>> = async (
    values
  ) => {
    // On Create
    if (type === 'Create') {
      const res = await createStore(values);

      if (res.error) {
        // Handle field-specific errors
        if ('slug' in res.error && res.error.slug) {
          form.setError('slug', { message: res.error.slug[0] });
        }
        if ('general' in res.error && res.error.general) {
          toast({
            variant: 'destructive',
            description: res.error.general[0],
          });
        } else {
          toast({
            variant: 'destructive',
            description: 'Failed to create store. Please check the form for errors.',
          });
        }
      } else {
        toast({
          description: 'Store created successfully',
        });
        // Force refresh the page to ensure new data is loaded
        router.push('/admin/stores');
        router.refresh();
      }
    }
  };

  return (
    <Form {...form}>
      <form
        method='POST'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <div className='flex flex-col md:flex-row gap-5'>
          {/* Store Name */}
          <FormField
            control={form.control}
            name='storeName'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof StoreSchema>,
                'storeName'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Enter store name'
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      form.setValue(
                        'slug',
                        slugify(e.target.value, { lower: true })
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Slug */}
          <FormField
            control={form.control}
            name='slug'
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof StoreSchema>,
                'slug'
              >;
            }) => (
              <FormItem className='w-full'>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder='Enter slug' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-col md:flex-row gap-5'>
          {/* Images */}
          <FormField
            control={form.control}
            name='image'
            render={() => (
              <FormItem className='w-full'>
                <FormLabel>Image</FormLabel>
                <Card>
                  <CardContent className='space-y-2 mt-2 min-h-48'>
                    <div className='flex-start space-x-2'>
                      {image && (
                        <Image
                          key={image}
                          src={image}
                          alt='store image'
                          className='w-20 h-20 object-cover object-center rounded-sm'
                          width={100}
                          height={100}
                        />
                      )}
                      <FormControl>
                        <UploadButton
                          endpoint='imageUploader'
                          onClientUploadComplete={(res: { url: string }[]) => {
                            form.setValue('image', res[0].url);
                          }}
                          onUploadError={(error: Error) => {
                            toast({
                              variant: 'destructive',
                              description: `ERROR! ${error.message}`,
                            });
                          }}
                        />
                      </FormControl>
                    </div>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* Description */}
        <FormField
          control={form.control}
          name='description'
          render={({
            field,
          }: {
            field: ControllerRenderProps<
              z.infer<typeof StoreSchema>,
              'description'
            >;
          }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Enter store description'
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex-between'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/admin/stores')}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? 'Creating...' : `${type} Store`}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StoreForm;
