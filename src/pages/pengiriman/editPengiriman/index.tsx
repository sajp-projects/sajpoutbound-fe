import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router";
import { Link } from "react-router";
import Joi from "joi";
import { joiResolver } from "@hookform/resolvers/joi";
import { useForm } from "react-hook-form";
import { ArrowLeft, Loader2, Save } from "lucide-react";

import { useShipment, useUpdateShipment } from "@/hooks/pengiriman";
import { useArmadas } from "@/hooks/armada";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Combobox } from "@/components/ui/combobox";
import { showSuccessAlert, showErrorAlert } from "@/utils/sweetAlert";
import { cn } from "@/lib/utils";
import { UpdateShipmentInput } from "@/types/pengiriman";

// Validasi plat nomor Indonesia
const plateNumberRegex = /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{1,3}$/;

const formSchema = Joi.object({
  type: Joi.string().valid("ANTAR", "JEMPUT").required().messages({
    "any.only": "Tipe harus ANTAR atau JEMPUT",
    "any.required": "Tipe pengiriman harus diisi",
  }),
  plateNumber: Joi.when("type", {
    is: "JEMPUT",
    then: Joi.string().pattern(plateNumberRegex).required().messages({
      "string.empty": "Plat nomor harus diisi",
      "string.pattern.base":
        "Format plat nomor tidak valid (contoh: B 1234 ABC)",
      "any.required": "Plat nomor harus diisi",
    }),
    otherwise: Joi.string().allow("").optional(),
  }),
  armadaId: Joi.when("type", {
    is: "ANTAR",
    then: Joi.string().required().messages({
      "string.empty": "Armada harus dipilih",
      "any.required": "Armada harus dipilih",
    }),
    otherwise: Joi.string().allow("").optional(),
  }),
  internalNote: Joi.string().allow("").optional(),
});

type FormValues = {
  type: "ANTAR" | "JEMPUT";
  plateNumber?: string;
  armadaId?: string;
  internalNote?: string;
};

export default function EditPengiriman() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [armadaSearchQuery, setArmadaSearchQuery] = useState("");

  const {
    data: shipment,
    isLoading,
    isError,
    error,
    refetch,
  } = useShipment(
    { id: id || "" },
    {
      enabled: !!id,
      refetchOnWindowFocus: false,
    }
  );

  // Fetch data armada dari API
  const {
    data: armadasData,
    isLoading: loadingArmadas,
    refetch: refetchArmadas,
  } = useArmadas({
    staleTime: 300000,
    refetchOnWindowFocus: false,
    searchQuery: armadaSearchQuery,
  });

  // Convert data dari API ke format ComboboxItem
  const armadas =
    armadasData?.armadas?.map((armada) => ({
      label: `${armada.model} - ${armada.plateNumber}`,
      value: armada.id,
      secondary: armada.description,
    })) || [];

  const updateShipment = useUpdateShipment({
    onSuccess: () => {
      showSuccessAlert("Berhasil!", "Pengiriman berhasil diperbarui").then(
        () => {
          navigate(`/pengiriman/${id}`);
        }
      );
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      showErrorAlert(
        "Gagal Memperbarui Pengiriman",
        error.message || "Terjadi kesalahan saat memperbarui pengiriman"
      );
    },
  });

  const form = useForm<FormValues>({
    resolver: joiResolver(formSchema),
    defaultValues: {
      type: "ANTAR",
      plateNumber: "",
      armadaId: "",
      internalNote: "",
    },
    mode: "onChange",
  });

  const watchType = form.watch("type");

  // Refetch data saat komponen pertama kali dimuat
  useEffect(() => {
    refetchArmadas();
  }, [refetchArmadas]);

  useEffect(() => {
    if (shipment) {
      form.reset({
        type: shipment.type,
        plateNumber: shipment.plateNumber || "",
        armadaId: shipment.armadaId || "",
        internalNote: shipment.internalNote || "",
      });
    }
  }, [shipment, form]);

  const handleArmadaSearch = useCallback(
    (query: string) => {
      setArmadaSearchQuery(query);
      refetchArmadas();
    },
    [refetchArmadas]
  );

  // Handler untuk perubahan tipe pengiriman
  const handleTypeChange = (value: "ANTAR" | "JEMPUT") => {
    // Reset field terkait
    form.resetField("plateNumber");
    form.resetField("armadaId");

    // Set nilai kosong secara eksplisit
    form.setValue("plateNumber", "");
    form.setValue("armadaId", "");

    // Hapus error jika ada
    form.clearErrors("plateNumber");
    form.clearErrors("armadaId");

    // Update tipe pengiriman
    form.setValue("type", value);
  };

  const onSubmit = (values: FormValues) => {
    setIsSubmitting(true);

    const payload: UpdateShipmentInput = {
      type: values.type,
      internalNote: values.internalNote || "",
    };

    if (values.type === "ANTAR" && values.armadaId) {
      payload.armadaId = values.armadaId;
      payload.plateNumber = "";
    } else if (values.type === "JEMPUT" && values.plateNumber) {
      payload.plateNumber = values.plateNumber;
      payload.armadaId = "";
    }

    updateShipment.mutate({
      id: id || "",
      ...payload,
    });
  };

  if (isLoading) {
    return <LoadingState text="Memuat data pengiriman..." />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal Memuat Data Pengiriman"
        message={
          error instanceof Error
            ? error.message
            : "Terjadi kesalahan saat memuat data pengiriman"
        }
        onRetry={refetch}
        retryButtonText="Coba lagi"
      />
    );
  }

  if (!shipment) {
    return (
      <div className="p-6 rounded-lg bg-red-50">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-red-700">
            Pengiriman tidak ditemukan
          </h2>
          <p className="mb-4 text-red-600">
            Data pengiriman dengan ID yang diberikan tidak ditemukan atau telah
            dihapus.
          </p>
          <Link to="/pengiriman">
            <Button>Kembali ke Daftar Pengiriman</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-6 sm:px-0">
      <div className="flex items-center">
        <Link to={`/pengiriman/${id}`}>
          <Button variant="ghost" size="sm" className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Kembali
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Pengiriman</h1>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle>Form Edit Pengiriman</CardTitle>
          <CardDescription>
            Perbarui detail pengiriman dengan ID:{" "}
            <code className="px-1 py-0.5 bg-gray-100 text-gray-800 rounded text-sm">
              {id}
            </code>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-6">
                {/* Informasi Dasar */}
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Informasi Dasar
                  </h3>
                  <div className="space-y-4">
                    {/* Tipe Pengiriman */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>
                            Tipe Pengiriman{" "}
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={handleTypeChange}
                              value={field.value}
                              className="flex flex-col space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="ANTAR" id="antar" />
                                <label
                                  htmlFor="antar"
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  Antar
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="JEMPUT" id="jemput" />
                                <label
                                  htmlFor="jemput"
                                  className="text-sm font-medium leading-none cursor-pointer"
                                >
                                  Jemput
                                </label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Field kondisional berdasarkan tipe */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {watchType === "JEMPUT" ? (
                        <div className="sm:col-span-2">
                          <FormField
                            control={form.control}
                            name="plateNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Plat Nomor Kendaraan{" "}
                                  <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    placeholder="Contoh: B 1234 ABC"
                                    disabled={isSubmitting}
                                    onChange={(e) => {
                                      field.onChange(
                                        e.target.value.toUpperCase()
                                      );
                                    }}
                                    className={cn(
                                      form.formState.errors.plateNumber &&
                                        "border-red-500"
                                    )}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ) : (
                        <div className="sm:col-span-2">
                          <FormField
                            control={form.control}
                            name="armadaId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Armada <span className="text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                  <Combobox
                                    items={armadas}
                                    value={field.value || ""}
                                    onValueChange={(val) => {
                                      field.onChange(val);
                                    }}
                                    placeholder="Pilih armada"
                                    searchPlaceholder="Cari armada..."
                                    isLoading={loadingArmadas}
                                    name="armadaId"
                                    onClear={() => field.onChange("")}
                                    onSearch={handleArmadaSearch}
                                    useServerSearch
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Catatan Internal */}
                <FormField
                  control={form.control}
                  name="internalNote"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Catatan Internal</FormLabel>
                      <p className="mb-2 text-sm text-gray-500">
                        Catatan tambahan untuk internal (opsional)
                      </p>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder="Tambahkan catatan internal (opsional)"
                          disabled={isSubmitting}
                          rows={4}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Tombol Aksi */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Link to={`/pengiriman/${id}`}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                    className="text-gray-700"
                  >
                    Batal
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-white bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Simpan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
