// 'use client';

// import React, { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';
// import { Button } from '../ui/Button';
// import { Input } from '../ui/Input';
// import { authService } from '@/lib/auth';
// import { signUpSchema } from '@/lib/validation';
// import { SignUpData } from '@/types/auth';

// export const SignUpForm: React.FC = () => {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState<SignUpData>({
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     phone: '',
//     userType: 'buyer',
//   });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//     if (errors[name]) {
//       setErrors(prev => ({
//         ...prev,
//         [name]: '',
//       }));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors({});

//     try {
//       signUpSchema.parse(formData);
//       setLoading(true);

//       const response = await authService.signUp(formData);
      
//       if (response.success) {
//         toast.success(response.message);
//         router.push(`/auth/verify-email?email=${encodeURIComponent(formData.email)}`);
//       } else {
//         toast.error(response.message);
//       }
//     // eslint-disable-next-line @typescript-eslint/no-explicit-any
//     } catch (error: any) {
//       if (error.errors) {
//         const validationErrors: Record<string, string> = {};
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         error.errors.forEach((err: any) => {
//           validationErrors[err.path[0]] = err.message;
//         });
//         setErrors(validationErrors);
//       } else if (error.response?.data?.errors) {
//         const validationErrors: Record<string, string> = {};
//         // eslint-disable-next-line @typescript-eslint/no-explicit-any
//         error.response.data.errors.forEach((err: any) => {
//           validationErrors[err.path] = err.msg;
//         });
//         setErrors(validationErrors);
//       } else {
//         toast.error(error.response?.data?.message || 'Something went wrong');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       {/* Mobile-optimized name fields - stack on very small screens */}
//       <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
//         <Input
//           label="First Name"
//           type="text"
//           name="firstName"
//           value={formData.firstName}
//           onChange={handleChange}
//           error={errors.firstName}
//           placeholder="John"
//           required
//         />
//         <Input
//           label="Last Name"
//           type="text"
//           name="lastName"
//           value={formData.lastName}
//           onChange={handleChange}
//           error={errors.lastName}
//           placeholder="Doe"
//           required
//         />
//       </div>

//       <Input
//         label="Email Address"
//         type="email"
//         name="email"
//         value={formData.email}
//         onChange={handleChange}
//         error={errors.email}
//         placeholder="john@example.com"
//         required
//       />

//       <Input
//         label="Phone Number"
//         type="tel"
//         name="phone"
//         value={formData.phone}
//         onChange={handleChange}
//         error={errors.phone}
//         placeholder="+1234567890"
//         required
//       />

//       <div>
//         <label htmlFor="userType" className="block text-sm font-semibold text-gray-700 mb-2">
//           I am a
//         </label>
//         <select
//           id="userType"
//           name="userType"
//           value={formData.userType}
//           onChange={handleChange}
//           className="block w-full px-4 py-3 sm:py-2 text-base sm:text-sm border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//           required
//         >
//           <option value="buyer">Buyer</option>
//           <option value="seller">Seller</option>
//           <option value="agent">Agent</option>
//         </select>
//       </div>

//       <Input
//         label="Password"
//         type="password"
//         name="password"
//         value={formData.password}
//         onChange={handleChange}
//         error={errors.password}
//         placeholder="Create a strong password"
//         helperText="Must contain uppercase, lowercase, and number"
//         required
//       />

//       <div className="pt-2">
//         <Button
//           type="submit"
//           loading={loading}
//           className="w-full"
//           size="lg"
//         >
//           Create Account
//         </Button>
//       </div>

//       <div className="text-center pt-4">
//         <button
//           type="button"
//           onClick={() => router.push('/auth/login')}
//           className="text-blue-600 hover:text-blue-500 text-sm font-medium transition-colors"
//         >
//           Already have an account? Sign in
//         </button>
//       </div>
//     </form>
//   );
// };
